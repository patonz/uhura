const nats = require("nats");
const connect = nats.connect;
const StringCodec = nats.StringCodec;
const protobuf = require("protobufjs");
const fs = require("fs");
const appRoot = require('app-root-path');
const UhuraCommonPkg = require("uhura_common");
const LinkTable = UhuraCommonPkg.LinkTable;




async function bootsrap() {
    const log = UhuraCommonPkg.ToolManager.getLogger("NATS_ADAPTER", "trace");
    const linkTable = new LinkTable(5);

    const stringCodec = StringCodec();



    let natsServerAddress = "nats://0.0.0.0:4222"

    if (process.env.NATS_SERVER_ADDRESS) {
        natsServerAddress = process.env.NATS_SERVER_ADDRESS
    }
    log.info(`NATS_SERVER_ADDRESS env: ${natsServerAddress}`);
    const nc = await connect({ servers: natsServerAddress, encoding: 'binary' });


    let adapterNatsServerAddress = natsServerAddress;
    let nc_adapter = nc;
    if (process.env.ADAPTER_NATS_SERVER_ADDRESS) {
        adapterNatsServerAddress = process.env.ADAPTER_NATS_SERVER_ADDRESS;
        nc_adapter = await connect({ servers: adapterNatsServerAddress, encoding: 'binary' });
    }
    log.info(`ADAPTER_NATS_SERVER_ADDRESS env: ${adapterNatsServerAddress}`);
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
    log.info("debug env: " + debug);


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
        log.info("requesting registration to core")
        const adapterProtoObj = Adapter.create(adapterObj) // creating a protobuffObj
        const r = await nc.request(`${core_id}.registerAdapter`, Adapter.encode(adapterProtoObj).finish()); // encoding the proto, then performing a request to a topic
        // "awaiting" the reply data
        let registeredAdapter = Adapter.toObject(Adapter.decode(r.data)) // decoding the reply data
        adapter = registeredAdapter; //assing to this adapter some extra information cames from the core
        log.debug(registeredAdapter) // debug print

        const subSendMessage = nc.subscribe(`${core_id}.${adapter.id}.sendMessage`);
        log.info(`listening on: ${subSendMessage.getSubject()}`);
        (async () => {
            for await (const m of subSendMessage) {
                nc_adapter.publish("adaptersNetwork", m.data)
                log.trace("received Uhura Message from Core, sending on adaptersNetwork");
            }
            log.warn("subscription closed");
        })();

    }, 2000);


    const subAdaptersNetwork = nc_adapter.subscribe('adaptersNetwork');
    log.info(`listening on: ${subAdaptersNetwork.getSubject()}`);
    (async () => {
        for await (const m of subAdaptersNetwork) {
            const dataObj = SendMessageRequest.toObject(SendMessageRequest.decode(m.data))
            if (dataObj.sender.id !== core_id) {
                if (debug) {
                    m.headers
                    log.debug(`rcv from network ${JSON.stringify(dataObj)}`);

                }
                nc.publish(`${core_id}.receivedMessageAdapter`, m.data);
            }
        }
        log.warn("subscription closed");
    })();



    log.info(`Uhura Virtual adapter started, core_id: "${core_id}"`)
}

bootsrap();