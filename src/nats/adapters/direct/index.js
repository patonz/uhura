import {
    connect, StringCodec
} from "nats";
import protobuf from 'protobufjs';
import fs from 'fs';


const stringCodec = StringCodec();
const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

const protoFolder = '../../../common/protos/';

let protoList = [];


fs.readdirSync(protoFolder).forEach(file => {
    protoList.push(`${protoFolder}${file}`);
});

/**
 * multiple uhure cores can run on the same machine, but an adapter can only be assigned to a single one.
 * all cores shares the same topics, but they will start with a different name in order to separate them.
 */
let core_id = "AlphaCore";
if(process.env.ID){
    core_id = process.env.ID;
}


let adapter;
let Message;
let Node;
let SendMessageRequest;
let Adapter;


await protobuf.load(protoList).then((root) => {
    Message = root.lookupType("uhura.Message");
    Node = root.lookupType('uhura.Node');
    SendMessageRequest = root.lookupType('uhura.SendMessageRequest');
    Adapter = root.lookupType('uhura.Adapter');
})

setTimeout(async () => {
    const adapterObj = { name: `${core_id}_adapter`, type: "nats" } // plain object
    console.log("requesting registration to core")
    const adapterProtoObj = Adapter.create(adapterObj) // creating a protobuffObj
    const r = await nc.request(`${core_id}.registerAdapter`, Adapter.encode(adapterProtoObj).finish()); // encoding the proto, then performing a request to a topic
    // "awaiting" the reply data
    let registeredAdapter = Adapter.toObject(Adapter.decode(r.data)) // decoding the reply data
    adapter = registeredAdapter; //assing to this adapter some extra information cames from the core
    console.log(registeredAdapter) // debug print

    const subSendMessage = nc.subscribe(`${core_id}.${adapter.id}.sendMessage`);
    (async () => {
        for await (const m of subSendMessage) {
            nc.publish("adaptersNetwork", m.data)
        }
        console.log("subscription closed");
    })();

}, 2000);


const subAdaptersNetwork = nc.subscribe('adaptersNetwork');
(async () => {
    for await (const m of subAdaptersNetwork) {
        const dataObj = SendMessageRequest.toObject(SendMessageRequest.decode(m.data))
        if (dataObj.sender.id !== core_id) {
            console.log(`rcv from network ${JSON.stringify(dataObj)}`);
            nc.publish(`${core_id}.receivedMessageAdapter`, m.data);
        }
    }
    console.log("subscription closed");
})();


setInterval(() => { }, 1 << 30);
console.log(`Uhura Virtual adapter started, core_id: "${core_id}"`)