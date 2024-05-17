
# Uhura: A Software Framework for Swarm Management in Multi-Radio Robotic Networks

### Swarm Networking System

Uhura facilitates communication both within an aerial swarm and between the swarm and ground devices, regardless of the multiple M2M communication technologies used. It includes a core module, known as the Uhura Core, which dynamically selects the most suitable adapter for each link based on the QoS needs of the application. The Uhura Adapter provides an abstraction layer for managing multiple M2M communication stacks.

In this project, some M2M technologies like BLE Mesh, socket, and XBee were tested. Also, since a classical scenario in the robotics field involves multiple Wi-Fi modules, Uhura is a good candidate for having just one high-level input/output layer.

The framework uses a pub/sub paradigm over [NATS.io](https://nats.io/) and is written mainly in TypeScript/JavaScript on Node.js.

The core and the adapters exchange data using Protobuf as a neutral structure. At the moment, there is no dedicated Uhura client, but it can be replicated using a NATS client and a Protobuf implementation, and then pub/sub on the two main topics:

- `UHURA_ID.sendMessage.binary`: where binary data can be published like a Protobuf
- `UHURA_ID.receivedMessage.binary`: where generic data is received like a Protobuf

In case of non-structured data, `UHURA_ID.sendMessage.text` and `UHURA_ID.receivedMessage.text` can be used to easily show plain text.

The library demonstrates the possibility of creating custom adapters for M2M not easily integrated into conventional systems. Since NATS has several clients, and thanks to the nature of the Uhura framework, more adapters can be implemented to manage communication between the two layers.

The project is still under development. Refer to papers or PhD thesis for more details.

Leonardo Montecchiari Ph.D
[Thesis](https://scholar.google.com/citations?view_op=view_citation&hl=it&user=C477N88AAAAJ&citation_for_view=C477N88AAAAJ:UeHWp8X0CEIC)

## Installation and Deployment Example

The best way is to use the all-in-one Dockerfile where a Uhura cluster over NATS.io can be easily deployed.

First, download this repo and then navigate inside the `src` folder. At this point, build the image using the following command:

```sh
docker build -t uhura -f uhura.Dockerfile .
```

This container will run a NATS server, a Uhura core, and an adapter over TCP/IP.

Now, decide how many Uhura instances are needed for your test. As a first test, consider implementing a simple sender/receiver like the one inside the `src/nats/example` folder.

Let's run them with the following commands:

##### For the Sender

```sh
docker run -e "NATS_SERVER_ADDRESS=0.0.0.0:4222" -e "ID=SENDER" -e "NATS_CLUSTER_PORT=6222" -e "ROUTES=" -e "UHURA_CORE_ID=SENDER_ID" -p 4222:4222 -p 6222:6222 --name sender_nats uhura
```

##### For the Receiver

```sh
docker run -e "NATS_SERVER_ADDRESS=0.0.0.0:4222" -e "ID=RECEIVER" -e "NATS_CLUSTER_PORT=6222" -e "ROUTES='nats-route://sender_nats:6222'" -e "UHURA_CORE_ID=RECEIVER_ID" -p 4322:4222 -p 6322:6222 --name receiver_nats --link sender_nats:sender_nats uhura
```

Where:
- `NATS_SERVER_ADDRESS` specifies the internal input connections for NATS
- `ID` is the NATS server ID, SENDER and RECEIVER in our case.
- `NATS_CLUSTER_PORT` is needed to connect the cluster on the same network.
- `ROUTES` is needed when we want to create a cluster, specifying an online server. The sender is our first server, so the receiver can connect to it. It is needed only for the startup for discovery purposes.
- `UHURA_CORE_ID` Uhura has its own ID over the cluster, needed for clients and adapters.

Then, we need to expose the ports, forwarding port 4222 for each new Uhura instance, as well as the cluster port 6222.

Now, simply install Node.js and then run `npm init` inside the `src/nats/example` folder.

Finally, run `node sender.js` and `node receiver.js`, or alternatively, use another NATS-client compatible approach.

This is a very basic setup. From this, it is possible to customize Uhura using multiple adapters or even the Service Discovery system.
