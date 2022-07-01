import UhuraCore from "uhura_core"
import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';

const nc = await connect({ servers: "demo.nats.io:4222", encoding: 'binary' });

let Test = undefined;
await protobuf.load("../protos/test.proto").then((root) => {
    Test = root.lookupType("testpackage.Test");
})



let payload = { payload: "ciao mamma", num: 77 };
let errMsg = Test.verify(payload);

if (errMsg) {
    throw Error(errMsg)
}
let message = Test.create(payload)
let buffer = Test.encode(message).finish();


// create a codec
const sc = StringCodec();
// create a simple subscriber and iterate over messages
// matching the subscription
const sub = nc.subscribe("sendMessage");
(async () => {
    for await (const m of sub) {

        console.log(m.data);
        UhuraCore.sendMessage(m.data);
       // console.log(`[${sub.getProcessed()}]: ${JSON.stringify(Test.decode(m.data))}`);
    }
    console.log("subscription closed");
})();