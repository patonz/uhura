import {
    connect, StringCodec
} from "nats";
;
const stringCodec = StringCodec();
const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

let uhura_core_id = `ALPHA` //change this accordingly to the right one

setInterval(() => {
    const messageText = `Hey! im using uhura!`
    console.log(`sending: ${messageText}`)
    nc.publish(`${uhura_core_id}.sendMessage.text`, stringCodec.encode(messageText));
}, 2000);