import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
const stringCodec = StringCodec();
const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

let uhura_core_id = `ALPHA` //change this accordingly to the right one

setInterval(() => {
    const messageText = `Hey! im using uhura!`
    console.log(`sending: ${messageText}`)
    nc.publish(`${uhura_core_id}.sendMessage.text`, stringCodec.encode(messageText));
}, 2000);


let Test;

await protobuf.load('./protos/test.proto').then((root) => {
    Test = root.lookupType("testpackage.Test");
})

let testObject = Test.create();
testObject.num = 17;
testObject.payload = "Hello from a protobuff!!!"

setInterval(() => {
    console.log(`sending a protobuff: ${JSON.stringify(testObject)}`)
    /**
     * testing a generic Uint8 array object as payload.
     */
    nc.publish(`${uhura_core_id}.sendMessage.binary`, Test.encode(testObject).finish());
}, 3000);