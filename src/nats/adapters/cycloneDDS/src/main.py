import asyncio
import os
import sys
from dataclasses import dataclass
from nats.aio.client import Client as NATS
from cyclonedds.domain import DomainParticipant
from cyclonedds.topic import Topic
from cyclonedds.sub import Subscriber, DataReader
from cyclonedds.pub import Publisher, DataWriter
from cyclonedds.idl import IdlStruct, Sequence
from cyclonedds.idl.types import sequence
from cyclonedds.util import duration
from proto.Adapter_pb2 import Adapter  # Protobuf class
from proto.Message_pb2 import Message
from proto.Node_pb2 import Node
from proto.SendMessage_pb2 import SendMessageRequest  # Protobuf class

import google.protobuf.json_format as pb_json
from adapter_manager import AdapterManager

from idl.dds_strctures import SendMessageDDS, NodeDDS, AdapterDDS, MessageDDS



@dataclass
class AdapterData(IdlStruct):
    data: sequence[int, 1024]  # Bounded sequence for serialized data

async def register_adapter(nats_client, core_id):
    """Register the adapter with NATS."""
    # Create the adapter object
    adapter = Adapter(
        name=f"{core_id}_adapter",
        type="cyclone_dds"
    )

    # Serialize the adapter to bytes
    message = adapter.SerializeToString()
    print(f"Registering adapter: {adapter}")
    print(f"{core_id}.registerAdapter....")

    # Send the registration request
    try:
        response = await nats_client.request(f"{core_id}.registerAdapter", message)
        print("Received raw response bytes.")
        
        # Parse the response back into an Adapter object
        received_adapter = Adapter()
        received_adapter.ParseFromString(response.data)

        # Print all fields of the received adapter (convert to JSON for easy reading)
        print("Received Adapter:")
        print(pb_json.MessageToJson(received_adapter))
        AdapterManager.set_adapter(received_adapter)

           # Extract adapter ID from the response
        adapter_id = received_adapter.id
        print(f"Adapter registered with ID: {adapter_id}")

            # Start listening on the appropriate topic
        await listen_on_nats_topic(nats_client, core_id, adapter_id)
    except nats.errors.NoRespondersError:
        print("No responder available for registerAdapter request.")
    except Exception as e:
        print(f"An error occurred: {e}")

async def listen_on_nats_topic(nats_client, core_id, adapter_id):
    """Listen on the NATS topic and forward messages to DDS."""
    topic_name = f"{core_id}.{adapter_id}.sendMessage"
    print(f"Listening on topic: {topic_name}")

    async def message_handler(msg):
        """Handle messages from NATS and forward them to DDS."""
        print(f"Received message on {msg.subject}")
        
        # Parse the message as a Protobuf object
        send_message = SendMessageRequest()
        send_message.ParseFromString(msg.data)
        print(send_message)
        # Forward the Protobuf message to DDS
        await forward_to_dds(send_message)

    await nats_client.subscribe(topic_name, cb=message_handler)

async def forward_to_dds(send_message):
    """Forward a Protobuf message to DDS."""

    sender_dds = NodeDDS(id=send_message.sender.id, adapter_id=send_message.sender.adapterId)

    source_dds = AdapterDDS(
        id=send_message.source.id,
        name=send_message.source.name,
        type=send_message.source.type,
        link_status=send_message.source.link_status
    )

    message_dds = MessageDDS(content=send_message.message.text, message_type=send_message.message.type)

    receivers_dds = [
        NodeDDS(id=receiver.id, adapter_id=receiver.adapterId)
        for receiver in send_message.receivers
    ]


    dds_message = SendMessageDDS(
        message=message_dds,
        priority=send_message.priority,
        sender=sender_dds,
        source=source_dds,
        receivers=receivers_dds
    )

    print(f"Forwarding to DDS: {dds_message}")

    partecipant = DomainParticipant()

    SendMessageDDS.__idl__.fill_type_data()

    topic = Topic(partecipant, 'adaptersNetwork', SendMessageDDS)
    publisher = Publisher(partecipant)
    writer = DataWriter(publisher, topic)

    writer.write(dds_message)

class DDSToNats:
    def __init__(self, dds_reader, nats_client, core_id):
        self.reader = dds_reader
        self.nats_client = nats_client
        self.core_id = core_id

    async def listen_and_forward(self):
        """Listen to DDS messages and forward them to NATS."""
        print("Listening for DDS messages...")
        while True:
            samples = list(self.reader.take_iter(timeout=duration(seconds=1)))
            if samples:
                for sample in samples:
                    serialized_message = bytes(sample.data)
                    await self.nats_client.publish(f"{self.core_id}.receivedMessage", serialized_message)
                    print("Forwarded to NATS.")
            await asyncio.sleep(0.1)

async def main():
    # Load environment variables
    nats_url = os.getenv("NATS_URL", "nats://localhost:4222")
    core_id = os.getenv("ID", "AlphaCore")

    # Connect to NATS
    nats_client = NATS()
    await nats_client.connect(servers=[nats_url])
    print("Connected to NATS server.")

    # Register the adapter
    await register_adapter(nats_client, core_id)

    # Initialize DDS entities
    participant = DomainParticipant()
    topic = Topic(participant, 'AdapterTopic', AdapterData)

    pub = Publisher(participant)

    sub = Subscriber(participant)
    reader = DataReader(sub, topic)

    dds_to_nats = DDSToNats(reader, nats_client, core_id)



    # Start the DDS-to-NATS listener
    await dds_to_nats.listen_and_forward()

if __name__ == "__main__":
    asyncio.run(main())