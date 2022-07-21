import UhuraCore from "uhura_core";
import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
import fs from 'fs';
const stringCodec = StringCodec();
const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

const protoFolder = '../../common/protos/';

let protoList = [];


fs.readdirSync(protoFolder).forEach(file => {
    protoList.push(`${protoFolder}${file}`);
});


const id = "AlphaCore";

let Message;
let Node;
let SendMessageRequest;
let DeviceProto;


await protobuf.load(protoList).then((root) => {
    Message = root.lookupType("uhura.Message");
    Node = root.lookupType('uhura.Node');
    SendMessageRequest = root.lookupType('uhura.SendMessageRequest');
    DeviceProto = root.lookupType('uhura.Device');
})

let message_payload = { text: "test non funziona un cazzo" };

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
(async () => {
    for await (const m of subSendMessage) {
        console.log("core.sendMessage called")
        const request = (SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));
        if (UhuraCore.getDeviceList().length > 0) {
            request.sender.adapter_id = UhuraCore.getDeviceList()[0]
            console.log(`[${subSendMessage.getProcessed()}]: ${JSON.stringify(SendMessageRequest.decode(m.data))}`);

            nc.publish(`${id}.${request.sender.adapter_id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
        }

    }
    console.log("subscription closed");
})();


const subRegisterAdapter = nc.subscribe(`${id}.registerAdapter`, {
    callback: (_err, msg) => {
        console.log("received a registerAdapter request")
        const deviceObj = DeviceProto.toObject(DeviceProto.decode(msg.data))
        console.log(deviceObj);

        const registeredDevice = UhuraCore.registerDevice(deviceObj);
        errMsg = DeviceProto.verify(registeredDevice);

        if (errMsg) {
            throw Error(errMsg)
        }
        let created = DeviceProto.create(registeredDevice)
        msg.respond(DeviceProto.encode(created).finish());
        console.log("done")
    },
});


const subReceivedMessage = nc.subscribe(`${id}.receivedMessageAdapter`);
(async () => {
    for await (const m of subReceivedMessage) {
       
        const request = (SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));
        console.log(`received a message ${JSON.stringify(request)}`);

    }
    console.log("subscription closed");
})();



/**heartbeat calls, basic for now */
let counter = 0;
setInterval(() => {
    let request = {
        message: { text: "hb"+counter },
        priority: 0,
        sender: { id: id, adapterId: "test1234" }
    }
    if (UhuraCore.getDeviceList().length > 0) {

        request.sender.adapterId = UhuraCore.getDeviceList()[0].id

        nc.publish(`${id}.${UhuraCore.getDeviceList()[0].id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
        counter++
    }

}, 5000);

setInterval(() => { }, 1 << 30);
console.log(`Uhura Core started, id: "${id}"`)