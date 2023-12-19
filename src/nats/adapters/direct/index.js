const nats = require("nats");
const connect = nats.connect;
const StringCodec = nats.StringCodec;
const protobuf = require("protobufjs");
const fs = require("fs");
const appRoot = require('app-root-path');
const UhuraCommonPkg = require("uhura_common");
const LinkTable = UhuraCommonPkg.LinkTable;



async function bootsrap() {
    const linkTable = new LinkTable(5);

    const stringCodec = StringCodec();
    const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

    const protoFolder = `${appRoot}/../../../common/protos/`;

    let protoList = [];


    fs.readdirSync(protoFolder).forEach(file => {
        protoList.push(`${protoFolder}${file}`);
    });

    /**
     * multiple uhure cores can run on the same machine, but an adapter can only be assigned to a single one.
     * all cores shares the same topics, but they will start with a different name in order to separate them.
     */
    let core_id = "AlphaCore";
    if (process.env.ID) {
        core_id = process.env.ID;
    }


    let debug = true;
    if (process.env.DEBUG === "true") {
        debug = true;
    } else debug = false;
    console.log("debug env: " + debug);


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
        console.log(`listening on: ${subSendMessage.getSubject()}`);
        (async () => {
            for await (const m of subSendMessage) {
                nc.publish("adaptersNetwork", m.data)
            }
            console.log("subscription closed");
        })();

    }, 2000);


    const subAdaptersNetwork = nc.subscribe('adaptersNetwork');
    console.log(`listening on: ${subAdaptersNetwork.getSubject()}`);
    (async () => {
        for await (const m of subAdaptersNetwork) {
            const dataObj = SendMessageRequest.toObject(SendMessageRequest.decode(m.data))
            if (dataObj.sender.id !== core_id) {
                if (debug) {
                    m.headers
                    console.log(`rcv from network ${JSON.stringify(dataObj)}`);
                    let frame = { sender: dataObj.sender.id, header: m.headers }
                    linkTable.addFrame();
                }
                nc.publish(`${core_id}.receivedMessageAdapter`, m.data);
            }
        }
        console.log("subscription closed");
    })();



    console.log(`Uhura Virtual adapter started, core_id: "${core_id}"`)
}

bootsrap();