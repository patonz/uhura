import UhuraCore from "uhura_core";
import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
import  fs from 'fs';
const stringCodec = StringCodec();
const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

const protoFolder = '../../common/protos/';

let protoList = [];


fs.readdirSync(protoFolder).forEach(file => {
  protoList.push(`${protoFolder}${file}`);
});


let Message;
let Node;
let SendMessageRequest;


await protobuf.load(protoList).then((root) => {
    Message = root.lookupType("uhura.Message");
    Node = root.lookupType('uhura.Node');
    SendMessageRequest = root.lookupType('uhura.SendMessageRequest');
})

let message_payload = { text : "test non funziona un cazzo" };

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
const sub = nc.subscribe("sendMessage");
(async () => {
    for await (const m of sub) {

      //  console.log(stringCodec.decode( m.data));
        UhuraCore.sendMessage(JSON.stringify(SendMessageRequest.decode(m.data)));
        console.log(SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));
        console.log(`[${sub.getProcessed()}]: ${JSON.stringify(SendMessageRequest.decode(m.data))}`);
    }
    console.log("subscription closed");
})();

// on receive message

setInterval(() => {
    nc.publish("receivedMessage", buffer)
}, 2000);


setInterval(() => {
    
}, 5000);


nc.publish("sendMessage", buffer);

setInterval(() => {}, 1 << 30);
console.log("Uhura Core started")