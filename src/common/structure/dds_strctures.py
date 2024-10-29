from cyclonedds.idl import IdlStruct
from dataclasses import dataclass

# NodeDDS struct corresponding to Node Protobuf
@dataclass
class NodeDDS(IdlStruct, typename="NodeDDS"):
    id: str
    adapter_id: str

# AdapterDDS struct corresponding to Adapter Protobuf
@dataclass
class AdapterDDS(IdlStruct, typename="AdapterDDS"):
    id: str
    name: str
    type: str
    link_status: str

# MessageDDS struct to represent the message content and type
@dataclass
class MessageDDS(IdlStruct, typename="MessageDDS"):
    content: str  # Assuming text content for now
    message_type: int  # Corresponds to Protobuf Type enum

# Main SendMessageDDS struct to wrap all nested structures
@dataclass
class SendMessageDDS(IdlStruct, typename="SendMessageDDS"):
    message: MessageDDS
    priority: int
    sender: NodeDDS
    source: AdapterDDS
    receivers: list[NodeDDS]
