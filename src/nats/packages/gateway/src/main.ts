import { connect, Msg, Subscription } from "nats";
import { checkEnvs } from "./checkEnvs";
import { ProcedureReq, ProcedureRes } from "./common/protos/generated"
import { ProcedureManager } from "./procedureManager";

async function bootstrap() {
  checkEnvs();
  const nc = await connect({ servers: "nats://0.0.0.0:4222" });

  const uhura_core_id = process.env.UHURA_CORE_ID;;

  ProcedureManager.getInstance().setNatsConnection(nc).setUhuraCoreId(uhura_core_id).setup();
  console.log(uhura_core_id);

}

function printMessage(subrscriber: Subscription, message: Msg) {
  console.log(`[${subrscriber.getSubject()}]: ${JSON.stringify(message.data)}`);
}



bootstrap();