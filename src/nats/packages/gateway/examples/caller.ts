import { connect } from 'nats';
import { ProcedureReq } from '../src/common/protos/generated';
import {DISCOVERY_FIND_SERVICES_SUBJECT,  DISCOVERY_ADD_SERVICE_SUBJECT, DISCOVERY_DEL_SERVICE_SUBJECT } from '../../uhura-discovery/src/common/constants';
import { FindServicesReq, FindServicesRes, AddServiceReq, AddServiceRes, DelServiceReq, DelServiceRes, Procedure, Service } from '../../uhura-discovery/src/common/protos/generated';


async function bootstrap() {
    const uhura_core_id = 'BETA';

    const connection = await connect({ servers: 'nats://0.0.0.0:4222' });

    const reqFindAll = FindServicesReq.encode({}).finish();
    const resFindAll = await connection.request(DISCOVERY_FIND_SERVICES_SUBJECT, reqFindAll);
    const resFindAllDecoded = FindServicesRes.decode(resFindAll.data);
    console.log('FindAll', resFindAllDecoded);

    let printProcedure;
    for (var prop in resFindAllDecoded.services[0].procedures) {
        // object[prop]
        printProcedure = resFindAllDecoded.services[0].procedures[prop];
        break;
    }


    console.log(printProcedure);
    const procedureReq: ProcedureReq = ProcedureReq.create();
    procedureReq.inputs = null;
    procedureReq.procedure = printProcedure;
    procedureReq.receiverUhuraId = "ALPHA";
    console.log(procedureReq);
    connection.publish(`${uhura_core_id}.callProcedure`, ProcedureReq.encode(procedureReq).finish());
    

}

bootstrap();