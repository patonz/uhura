


const UhuraCorePkg = require('uhura_core');
const appRoot = require('app-root-path');
const UhuraCore = UhuraCorePkg.UhuraCore;
const Adapter = UhuraCorePkg.Adapter;
const nats = require('nats');
const connect = nats.connect;
const StringCodec = nats.StringCodec;
const protobuf = require('protobufjs');
const fs = require('fs');
const stringCodec = StringCodec();
async function bootsrap() {
    const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

    const protoFolder = `${appRoot}/../../common/protos/`;

    let protoList = [];


    fs.readdirSync(protoFolder).forEach(file => {
        protoList.push(`${protoFolder}${file}`);
    });


    let id = "AlphaCore";
    if (process.env.ID) {
        id = process.env.ID;
    }

    let debug = true;
    if (process.env.DEBUG === "true") {
        debug = true;
    } else debug = false;
    console.log("debug env: "+debug);



    let Message;
    let Node;
    let SendMessageRequest;
    let AdapterProto;




    await protobuf.load(protoList).then((root) => {
        Message = root.lookupType("uhura.Message");
        Node = root.lookupType('uhura.Node');
        SendMessageRequest = root.lookupType('uhura.SendMessageRequest');
        AdapterProto = root.lookupType('uhura.Adapter');
    })





    let message_payload = { text: "test test", type: 0 };

    let errMsg = Message.verify(message_payload);

    if (errMsg) {
        throw Error(errMsg)
    }
    let send_message_payload = { message: message_payload }
    console.log(send_message_payload);


    errMsg = SendMessageRequest.verify(send_message_payload);

    if (errMsg) {
        throw Error(errMsg)
    }


    let sendMessageReuquestTest = SendMessageRequest.create(send_message_payload)
    let buffer = SendMessageRequest.encode(sendMessageReuquestTest).finish();


    // create a codec
    const sc = StringCodec();
    // create a simple subscriber and iterate over messages
    // matching the subscription
    const subSendMessage = nc.subscribe(`${id}.sendMessage`);
    console.log(`listening on: ${subSendMessage.getSubject()}`);
    (async () => {
        for await (const m of subSendMessage) {
            console.log("core.sendMessage called")
            const request = (SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));

            let adapter = UhuraCore.getAdapterByRequest(request);
            if (typeof adapter === Adapter) {
                request.sender.adapterId = adapter.id
                console.log(`[${subSendMessage.getProcessed()}]: ${JSON.stringify(SendMessageRequest.decode(m.data))}`);

                nc.publish(`${id}.${request.sender.adapter_id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            }

        }
        console.log("subscription closed");
    })();

    const subSendMessageText = nc.subscribe(`${id}.sendMessage.text`);
    console.log(`listening on: ${subSendMessageText.getSubject()}`);
    (async () => {
        for await (const m of subSendMessageText) {
            console.log(`[${subSendMessageText.getSubject()}]: ${stringCodec.decode(m.data)}`);
            let request = {
                message: { text: stringCodec.decode(m.data), type: 0 },
                priority: 0,
                sender: { id: id }
            }
            let adapter = UhuraCore.getAdapterByRequest(request);
            if (typeof adapter === Adapter) {
                request.sender.adapterId = adapter.id
                nc.publish(`${id}.${adapter.id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            }

        }
        console.log("subscription closed");
    })();

    const subSendMessageBinary = nc.subscribe(`${id}.sendMessage.binary`);
    console.log(`listening on: ${subSendMessageBinary.getSubject()}`);
    (async () => {
        for await (const m of subSendMessageBinary) {
            console.log(`[${subSendMessageBinary.getSubject()}]: ${JSON.stringify(m.data)}`);
            let request = {
                message: { binary: m.data, type: 0 },
                priority: 0,
                sender: { id: id }
            }

            let adapter = UhuraCore.getAdapterByRequest(request);
            if (adapter instanceof Adapter) {
                request.sender.adapterId = adapter.id
                console.log(`sending binary to:[${id}.${adapter.id}.sendMessage]`);
                nc.publish(`${id}.${adapter.id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            }

        }
        console.log("subscription closed");
    })();



    const subRegisterAdapter = nc.subscribe(`${id}.registerAdapter`, {
        callback: (_err, msg) => {
            console.log("received a registerAdapter request")
            const adapterObj = AdapterProto.toObject(AdapterProto.decode(msg.data))
            console.log(adapterObj);

            const registeredAdapter = UhuraCore.registerAdapter(adapterObj);
            errMsg = AdapterProto.verify(registeredAdapter);

            if (errMsg) {
                throw Error(errMsg)
            }
            let created = AdapterProto.create(registeredAdapter)
            msg.respond(AdapterProto.encode(created).finish());
            console.log("done")
        },
    });


    const subReceivedMessage = nc.subscribe(`${id}.receivedMessageAdapter`);
    console.log(`listening on: ${subReceivedMessage.getSubject()}`);
    (async () => {
        for await (const m of subReceivedMessage) {

            const request = (SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));

            if (request.message.type == 0 || request.message.type == 1) {
                if (request.message.text) {
                    if (request.message.text.contains("HB#")) {
                        //HB RECEIVED, handle for more infos
                    } else {
                        if (debug) {
                            console.log(`received a message.text ${JSON.stringify(request)}`);
                        }

                    }
                    nc.publish(`${id}.receivedMessage.text`, stringCodec.encode(request.message.text))
                }

                if (request.message.binary) {
                    if (debug) {
                        console.log(`received a message.binary ${JSON.stringify(request)}`);
                    }
                    nc.publish(`${id}.receivedMessage.binary`, request.message.binary)
                }
            }


        }
        console.log("subscription closed");
    })();



    /**heartbeat calls, basic for now */
    let counter = 0;
    setInterval(() => {
        let request = {
            message: { text: "HB#" + counter, type: 2 },
            priority: 0,
            sender: { id: id, adapterId: "test1234" }
        }

        let adapter = UhuraCore.getAdapterByRequest(request);

        if (adapter instanceof Adapter) {

            request.sender.adapterId = adapter.id
            if (debug) {
                console.log(`sending heartbeat to ${id}.${adapter.id}.sendMessage`);
            }

            nc.publish(`${id}.${adapter.id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            counter++
        }
    }, 5000);

    setInterval(() => { }, 1 << 30);
    console.log(`Uhura Core started, id: "${id}"`)

};

bootsrap();