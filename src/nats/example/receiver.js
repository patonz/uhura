import {
    connect, StringCodec
} from "nats";
;
const stringCodec = StringCodec();
const nc = await connect({ servers: "nats://0.0.0.0:4222", encoding: 'binary' });

let uhura_core_id = `BETA` //change this accordingly to the right one

const sub = nc.subscribe(`${uhura_core_id}.receivedMessage.text`);
(async () => {
    for await (const m of sub) {
        console.log(`[${sub.getSubject()} ${sub.getProcessed()}]: ${stringCodec.decode(m.data)}`);
    }
    console.log("subscription closed");
})();