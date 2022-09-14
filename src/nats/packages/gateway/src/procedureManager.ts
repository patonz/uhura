import { Console } from "console";
import { Msg, NatsConnection, Subscription } from "nats"
import { ProcedureReq, ProcedureRes } from "./common/protos/generated";

export class ProcedureManager {
    private static instance: ProcedureManager;
    private nc: NatsConnection;
    private uhura_core_id: string;

    constructor() { }

    public static getInstance(): ProcedureManager {
        if (!ProcedureManager.instance) {
            ProcedureManager.instance = new ProcedureManager();
        }

        return ProcedureManager.instance;
    }

    public setNatsConnection(connection: NatsConnection): ProcedureManager {
        this.nc = connection;
        return ProcedureManager.instance
    }

    public setUhuraCoreId(uhura_core_id: string): ProcedureManager {
        this.uhura_core_id = uhura_core_id
        return ProcedureManager.instance;
    }

    public setup() {
        this.handleRemoteProcedureCalls();
        this.setupProcedureCaller();
    }

    private handleRemoteProcedureCalls() {
        const sub = this.nc.subscribe(`${this.uhura_core_id}.receivedMessage.binary`);
        const procedureTypes = [ProcedureReq, ProcedureRes];
        (async () => {
            for await (const m of sub) {
                console.log(m.data);

                let procedureType: ProcedureReq | ProcedureRes;


                for (const prodType of procedureTypes) {
                    console.log("ce sto a prova");
                    try {
                        const prodTypeObj = prodType.decode(m.data);
                        procedureType = prodTypeObj;
                        break;
                    } catch (error) {
                        console.error(error);
                    }
                }

                console.log(procedureType);
                if (procedureType.procedure && procedureType.procedure.name) {
                    switch (procedureType.constructor.name) {
                        case ProcedureReq.name:
                            this.handleProcedureReq(m);
                            break;

                        case ProcedureRes.name:
                            this.handleProcedureRes(m);
                            break;

                        default:
                            break;
                    }
                }
            }
            console.log("subscription closed");
        })();
    }


    private setupProcedureCaller() {
        const sub: Subscription = this.nc.subscribe(`${this.uhura_core_id}.callProcedure`);
        (async () => {
            for await (const m of sub) {
                console.log("received a message")
                try {
                    console.log("new message, trying to decode into a valid procedure")
                    const procedureReq: ProcedureReq = ProcedureReq.decode(m.data);
                    procedureReq.senderUhuraId = this.uhura_core_id;
                    /**@todo resolve destination by procedure */
                    console.log(procedureReq)
                    if (procedureReq.receiverUhuraId) {
                        console.log("sending procedure to: " + procedureReq.receiverUhuraId);
                        this.nc.publish(`${this.uhura_core_id}.sendMessage.binary`, ProcedureReq.encode(procedureReq).finish())
                    }
                } catch (error) {

                }
            }
        })();
    }

    private handleProcedureReq(message: Msg) {
        const procedureReq = ProcedureReq.decode(message.data);
        console.log(procedureReq);
        switch (procedureReq.procedure.type) {
            case "nats":
                let subject = procedureReq.procedure.name;
                if(procedureReq.receiverUhuraId === "broadcast"){
                    subject = subject.replace("broadcast", this.uhura_core_id);
                }
                console.log(`subject resolved for procedure: ${subject}`)
                this.nc.publish(subject, message.data);
                break;

            default:
                break;
        }

    }

    private handleProcedureRes(message: Msg) {

    }
}