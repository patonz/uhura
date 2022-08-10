import { connect } from 'nats';
import { ProcedureReq } from '../src/common/protos/generated';
import { DISCOVERY_ADD_SERVICE_SUBJECT, DISCOVERY_DEL_SERVICE_SUBJECT } from '../../uhura-discovery/src/common/constants';
import { AddServiceReq, AddServiceRes, DelServiceReq, DelServiceRes, Procedure, Service } from '../../uhura-discovery/src/common/protos/generated';

const serviceData = {
    name: 'Hello',
    description: 'My Hello Service',
    nodeId: 'ALPHA', // uhura id
};

async function bootstrap() {
    const connection = await connect({ servers: 'nats://0.0.0.0:4222' });

    /**protobuff from js object */
    let service = Service.create(serviceData);

    let addServiceReq = AddServiceReq.create();
    addServiceReq.service = service;

    let addMe = AddServiceReq.encode(addServiceReq).finish();
    console.log(`requesting registration of ${service.name} on uhura-discovery`);
    const addMeRes = await connection.request(DISCOVERY_ADD_SERVICE_SUBJECT, addMe);
    const addMeResDecoded = AddServiceRes.decode(addMeRes.data)


    console.log('addMe', addMeResDecoded);
    console.log(`done`);


    console.log("updating service with a procedure based on the generated serviceId")
    service.id = addMeResDecoded.serviceId;
    /**empty proto then filled */
    let printProcedure = Procedure.create();
    printProcedure.name = `${service.nodeId}.${service.id}.print`; // nats specific example
    printProcedure.description = "prints Hello! :D"
    printProcedure.reply = false // opt for now
    printProcedure.type = "nats";
    printProcedure.inputFields = null // act as "no params"


    service.procedures[printProcedure.name] = printProcedure;
    addServiceReq.service = service;

    addMe = AddServiceReq.encode(addServiceReq).finish();

    await connection.request(DISCOVERY_ADD_SERVICE_SUBJECT, addMe);


    const sub = connection.subscribe(printProcedure.name);
    (async () => {
        for await (let m of sub) {
            try {
                const request: ProcedureReq = ProcedureReq.decode(m.data);
                console.log(`received from ${request.senderUhuraId} a ${request.procedure.name} procedure request`);


                switch (request.procedure.name) {
                    case  printProcedure.name:
                            console.log(`performing ${request.procedure.name}`)
                            console.log("HELLO!!!");
                        break;
                
                    default:
                        break;
                }
            } catch (error) {

            }
        }
    })

}

bootstrap();