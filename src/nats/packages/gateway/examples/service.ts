import { connect } from 'nats';
import { ProcedureReq } from '../src/common/protos/generated';
import { DISCOVERY_ADD_SERVICE_SUBJECT } from '../../uhura-discovery/src/common/constants';
import { AddServiceReq, AddServiceRes, Procedure, Service } from '../../uhura-discovery/src/common/protos/generated';

const serviceData = {
    name: 'Hello',
    description: 'My Hello Service',
    nodeId: 'ALPHA', // uhura node id
};

async function bootstrap() {
    const connection = await connect({ servers: 'nats://0.0.0.0:4222' });

    /**protobuff from js object */
    let service = Service.create(serviceData);
    service.id = "test";

    let addServiceReq = AddServiceReq.create();
    addServiceReq.service = service;

    let addMe = AddServiceReq.encode(addServiceReq).finish();
    console.log(`requesting registration of ${service.name} on uhura-discovery`);
    const addMeRes = await connection.request(`${service.nodeId}:${DISCOVERY_ADD_SERVICE_SUBJECT}`, addMe);
    const addMeResDecoded = AddServiceRes.decode(addMeRes.data)


    console.log('addMe', addMeResDecoded);
    console.log(`done`);


    console.log("updating service with a procedure based on the generated serviceId")
    service.id = addMeResDecoded.serviceId;


    /**new procedure from empty instance */
    let printProcedure = Procedure.create();
    printProcedure.name = `${service.nodeId}.${service.id}.print`; // nats specific example
    printProcedure.description = "prints Hello! :D"
    printProcedure.reply = false // opt for now
    printProcedure.type = "nats";
    printProcedure.inputFields = null // act as "no params"


    service.procedures[printProcedure.name] = printProcedure;
    addServiceReq.service = service;

    addMe = AddServiceReq.encode(addServiceReq).finish();

    /**with the same id, we can update the service using the same request */
    await connection.request(`${service.nodeId}:${DISCOVERY_ADD_SERVICE_SUBJECT}`, addMe);


    /**as described on the procedure, we MUST implement its behavior: the callable procedure */
    const sub = connection.subscribe(printProcedure.name);
    (async () => {
        for await (let m of sub) {
            console.log("received a message");
            try {
                const request: ProcedureReq = ProcedureReq.decode(m.data);
                console.log(`received from ${request.senderUhuraId} a ${request.procedure.name} procedure request`);


                switch (request.procedure.name) {
                    case printProcedure.name:
                        console.log(`performing ${request.procedure.name}`)
                        console.log("HELLO!!!");
                        break;

                    default:
                        break;
                }
            } catch (error) {

            }
        }
        console.log("subscription closed");
    })();

}

bootstrap();