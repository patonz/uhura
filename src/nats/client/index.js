import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
const { protobuffer } = protobuf;
import * as fs from 'fs';


// to create a connection to a nats-server:
const nc = await connect({ servers: "demo.nats.io:4222", encoding: 'binary' });
let Test = undefined;
await protobuf.load("./protos/test.proto").then((root) => {
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
const sub = nc.subscribe("hello");
(async () => {
    for await (const m of sub) {
        console.log(`[${sub.getProcessed()}]: ${JSON.stringify(Test.decode(m.data))}`);
    }
    console.log("subscription closed");
})();

nc.publish("hello", buffer);



nc.publish("hello", buffer);

// we want to insure that messages that are in flight
// get processed, so we are going to drain the
// connection. Drain is the same as close, but makes
// sure that all messages in flight get seen
// by the iterator. After calling drain on the connection
// the connection closes.
await nc.drain();