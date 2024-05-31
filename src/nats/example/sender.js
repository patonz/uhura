import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
import ip  from 'ip';
const stringCodec = StringCodec();

let natServerAddress = "nats://0.0.0.0:4222"
if (process.env.NATS_SERVER_ADDRESS) {
    natServerAddress = process.env.NATS_SERVER_ADDRESS
}
console.log(`NATS_SERVER_ADDRESS env: ${natServerAddress}`);


let id = "AlphaCore";
if (process.env.ID) {
    id = process.env.ID;
}
console.log(`ID env: ${id}`);


const nc = await connect({ servers: natServerAddress, encoding: 'binary' });

let uhura_core_id = id //change this accordingly to the right one

// setInterval(() => {
//     const messageText = `Hey! im using uhura!`
//     console.log(`sending: ${messageText}`)
//     nc.publish(`${uhura_core_id}.sendMessage.text`, stringCodec.encode(messageText));
// }, 2000);




let containerIp = ip.address();

console.log('Container IP:', containerIp);




let Test;

await protobuf.load('./protos/test.proto').then((root) => {
    Test = root.lookupType("testpackage.Test");
})

let testObject = Test.create();
testObject.num = 17;


   // console.log(networkInterfaces())
   testObject.payload = "Hello from a "+ containerIp





setInterval(() => {
    console.log(`sending a protobuff: ${JSON.stringify(testObject)}`)
    /**
     * testing a generic Uint8 array object as payload.
     */
    nc.publish(`${uhura_core_id}.sendMessage.binary`, Test.encode(testObject).finish());
   
}, 1000);