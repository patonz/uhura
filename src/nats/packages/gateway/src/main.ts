import { connect } from "nats";

async function bootstrap() {
    const nc = await connect({ servers: "nats://0.0.0.0:4222" });
    console.log(nc.stats())



    const uhura_core_id = "BETA";
    const sub = nc.subscribe(`${uhura_core_id}.receivedMessage.binary`);
    (async () => {
        for await (const m of sub) {
          console.log(`[${sub.getSubject()}]: ${JSON.stringify(m.data)}`);
        }
        console.log("subscription closed");
      })();
}

bootstrap();