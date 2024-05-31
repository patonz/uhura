import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
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

const subText = nc.subscribe(`${uhura_core_id}.receivedMessage.text`);
(async () => {
    for await (const m of subText) {
        console.log(`[${subText.getSubject()} ${subText.getProcessed()}]: ${stringCodec.decode(m.data)}`);
    }
    console.log("subscription closed");
})();

let Test;

await protobuf.load('./protos/test.proto').then((root) => {
    Test = root.lookupType("testpackage.Test");
})


const subBinary = nc.subscribe(`${uhura_core_id}.receivedMessage.binary`);
(async () => {
    for await (const m of subBinary) {
        try {
            let testObject = Test.decode(m.data);

            console.log(`[${subBinary.getSubject()} ${subBinary.getProcessed()}]: ${JSON.stringify(testObject)}`);
        } catch (error) {
            /**
             * the binary cannot be decoded as Test protobuff object.
             */
        }


      
    }
    console.log("subscription closed");
})();
