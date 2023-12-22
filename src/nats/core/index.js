


const UhuraCorePkg = require('uhura_core');
const UhuraCommonPkg = require("uhura_common");
const appRoot = require('app-root-path');
const UhuraCore = UhuraCorePkg.UhuraCore;
const Adapter = UhuraCorePkg.Adapter;
const ToolManager = UhuraCommonPkg.ToolManager;
const LinkTable = UhuraCommonPkg.LinkTable;
const luxon = require("luxon");

const nats = require('nats');
const connect = nats.connect;
const StringCodec = nats.StringCodec;
const protobuf = require('protobufjs');
const fs = require('fs');
const v8 = require('v8');

const stringCodec = StringCodec();
async function bootstrap() {

    const logger = ToolManager.getLogger("CORE", "trace")


    /**
     * @typedef {Object} Frame
     * @property {number} header
     * @property {number} id
     * @property {string} sender
     * @property {number} rssi
     * @property {number} timestamp
     * @property {number} cadence
     */

    /**
     * @typedef {Object} LinkTable
     * @property {function(maxFrame): void} constructor - Create a LinkTable.
     * @property {function(nodeIdString, Frame): void} addFrame - Adds a frame to the link table.
     * @property {function(): pdr} updateAll - Periodically updates all nodes in the link table.
     * @property {function(nodeIdString): Object} update - Updates a specific node in the link table.
    */



    /** @type {Object<string, LinkTable>} */
    const linkTables = {}

    let natServerAddress = "nats://0.0.0.0:4222"

    if (process.env.NATS_SERVER_ADDRESS) {
        natServerAddress = process.env.NATS_SERVER_ADDRESS
    }
    logger.info(`NATS_SERVER_ADDRESS env: ${natServerAddress}`);

    const nc = await connect({ servers: natServerAddress, encoding: 'binary' }).catch(error => {
        logger.error(error);
    });

    const protoFolder = `${appRoot}/../../common/protos/`;

    let protoList = [];


    fs.readdirSync(protoFolder).forEach(file => {
        protoList.push(`${protoFolder}${file}`);
    });


    let id = "AlphaCore";
    if (process.env.ID) {
        id = process.env.ID;
    }
    logger.info(`ID env: ${id}`);

    let cadence = 2000;
    if (process.env.CADENCE) {
        cadence = process.env.CADENCE;
    }
    logger.info(`cadence env:  ${cadence}`);


    let debug = true;
    if (process.env.DEBUG === "true") {
        debug = true;
    } else debug = false;
    logger.info(`debug env:  ${debug}`);



    let Message;
    let Node;
    let SendMessageRequest;
    let AdapterProto;




    await protobuf.load(protoList).then((root) => {
        Message = root.lookupType("uhura.Message");
        Node = root.lookupType('uhura.Node');
        SendMessageRequest = root.lookupType('uhura.SendMessageRequest');
        AdapterProto = root.lookupType('uhura.Adapter');
    })

    // let message_payload = { text: "test test", type: 0 };

    // let errMsg = Message.verify(message_payload);

    // if (errMsg) {
    //     throw Error(errMsg)
    // }
    // let send_message_payload = { message: message_payload }
    // logger.debug("payload: %o",send_message_payload);


    // errMsg = SendMessageRequest.verify(send_message_payload);

    // if (errMsg) {
    //     throw Error(errMsg)
    // }


    // let sendMessageReuquestTest = SendMessageRequest.create(send_message_payload)
    // let buffer = SendMessageRequest.encode(sendMessageReuquestTest).finish();


    // create a codec
    const sc = StringCodec();
    // create a simple subscriber and iterate over messages
    // matching the subscription
    const subSendMessage = nc.subscribe(`${id}.sendMessage`);
    logger.info(`listening on: ${subSendMessage.getSubject()}`);
    (async () => {
        for await (const m of subSendMessage) {
            console.log("core.sendMessage called")
            const request = (SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));

            let adapters = UhuraCore.getAdapterList()
            if (typeof adapter === Adapter) {
                request.sender.adapterId = adapter.id
                logger.info(`[${subSendMessage.getProcessed()}]: ${JSON.stringify(SendMessageRequest.decode(m.data))}`);

                nc.publish(`${id}.${request.sender.adapter_id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            }

        }
        console.log("subscription closed");
    })();

    const subSendMessageText = nc.subscribe(`${id}.sendMessage.text`);
    console.log(`listening on: ${subSendMessageText.getSubject()}`);
    (async () => {
        for await (const m of subSendMessageText) {
            logger.info(`[${subSendMessageText.getSubject()}]: ${stringCodec.decode(m.data)}`);
            let request = {
                message: { text: stringCodec.decode(m.data), type: 0 },
                priority: 0,
                sender: { id: id }
            }
            let adapter = UhuraCore.getAdapterByRequest(request);
            if (typeof adapter === Adapter) {
                request.sender.adapterId = adapter.id
                nc.publish(`${id}.${adapter.id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            }

        }
        console.log("subscription closed");
    })();

    const subSendMessageBinary = nc.subscribe(`${id}.sendMessage.binary`);
    console.log(`listening on: ${subSendMessageBinary.getSubject()}`);
    (async () => {
        for await (const m of subSendMessageBinary) {
            console.log(`[${subSendMessageBinary.getSubject()}]: ${JSON.stringify(m.data)}`);
            let request = {
                message: { binary: m.data, type: 0 },
                priority: 0,
                sender: { id: id }
            }

            let adapters = UhuraCore.getAdapterList()
            let bestLink = { type: undefined, pdr: 0 }
           
            for (let type in linkTables) {

                /** @type {LinkTable} */
                let linkTable = linkTables[type];
                let pdr = linkTable.updateAll();
                console.log('pdr:'+pdr)
                if (pdr > bestLink.pdr) {
                    bestLink.type = type;
                    bestLink.pdr = pdr;
                }

            }

            console.log(bestLink);
            let adapter;
            for (let i in adapters) {
                let adapterCandidate = adapters[i]
                console.log(adapterCandidate)
                console.log(bestLink)
                if (adapterCandidate.type === bestLink.type) {
                    adapter = adapterCandidate;
                    break;
                }
            }
            console.log(adapter)
            
           

            if (adapter instanceof Adapter) {
                let toLog = `snd; ${request.message.type}; ${adapter.type}; ${NaN}; ${bestLink.pdr}; ${NaN}; ${id}; ${v8.serialize(request).length}; ${luxon.DateTime.now().toFormat("dd-MM-yyyy_HH-mm-ss")};`
                ToolManager.logToFile(toLog, "HB_laptop");
                request.sender.adapterId = adapter.id
                logger.info(`sending binary to:[${id}.${adapter.id}.sendMessage]`);
                nc.publish(`${id}.${adapter.id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())
            }

        }
        console.log("subscription closed");
    })();



    const subRegisterAdapter = nc.subscribe(`${id}.registerAdapter`, {
        callback: (_err, msg) => {
            console.log("received a registerAdapter request")
            const adapterObj = AdapterProto.toObject(AdapterProto.decode(msg.data))
            console.log(adapterObj);

            const registeredAdapter = UhuraCore.registerAdapter(adapterObj);
            errMsg = AdapterProto.verify(registeredAdapter);

            if (errMsg) {
                throw Error(errMsg)
            }
            let createdAdapter = AdapterProto.create(registeredAdapter)
            msg.respond(AdapterProto.encode(createdAdapter).finish());
            console.log("done")
            linkTables[createdAdapter.type] = new LinkTable(100)
        },
    });


    const subReceivedMessage = nc.subscribe(`${id}.receivedMessageAdapter`);
    console.log(`listening on: ${subReceivedMessage.getSubject()}`);
    (async () => {
        for await (const m of subReceivedMessage) {

            const request = (SendMessageRequest.toObject(SendMessageRequest.decode(m.data)));
            //check if is an HB
            if (request.message.type == 2) {
                let sender = request.sender;
                let source = request.source;

                let counter
                let cadence

                let content = JSON.parse(request.message.text)

                if (content.counter) {
                    counter = content.counter
                }

                if (content.cadence) {
                    cadence = content.cadence
                }
                console.log(source)
                let linkTable = linkTables[source.type]
                console.log(linkTable)
                if (linkTables[source.type] instanceof LinkTable) {
                    /** @type {Frame} */ 
                    let frame = {
                        header: undefined,
                        id: counter,
                        sender: sender.id,
                        rssi: undefined,
                        timestamp: undefined,
                        cadence: cadence,
                    }
                    
                    linkTable.addFrame(sender.id, frame)
                    let pdrAdapter = linkTable.updateAll()
                    let toLog = `rcv; ${request.message.type}; ${source.type}; ${frame.id}; ${pdrAdapter}; ${frame.cadence}; ${frame.sender.id}; ${v8.serialize(m.data).length}; ${luxon.DateTime.now().toFormat("dd-MM-yyyy_HH-mm-ss")}`
                    ToolManager.logToFile(toLog, "HB_laptop")
                }
                logger.debug(`received a message.text ${JSON.stringify(request)}`);
            }



            if (request.message.type == 0 || request.message.type == 1) {
                if (request.message.text) {

                    



                    nc.publish(`${id}.receivedMessage.text`, stringCodec.encode(request.message.text))
                }

                if (request.message.binary) {

                    logger.info(`received a message.binary ${JSON.stringify(request)}`);

                    nc.publish(`${id}.receivedMessage.binary`, request.message.binary)
                }
            }


        }
        console.log("subscription closed");
    })();



    /**heartbeat calls, basic for now */
    logger.debug('starting HB process')
    let counter = 0;
    setInterval(() => {

        let adapters = UhuraCore.getAdapterList()

        for (adapter of adapters) {

            let payload = {
                counter: counter,
                cadence: cadence
            }
            let request = {
                message: { text: JSON.stringify(payload), type: 2 },
                priority: 0,
                sender: { id: id, adapterId: adapter.id },
                source: adapter
            }

            if (adapter instanceof Adapter) {
                request.sender.adapterId = adapter.id
                logger.debug(`sending heartbeat to ${id}.${adapter.id}.sendMessage`);


                nc.publish(`${id}.${adapter.id}.sendMessage`, SendMessageRequest.encode(SendMessageRequest.create(request)).finish())

            }
        }

        counter++





    }, cadence);

    setInterval(() => { }, 1 << 30); // keep alive the process with an infinite interval for an empty function. just avoiding pm2 
    logger.info(`Uhura Core started, id: "${id}"`)

};

bootstrap();