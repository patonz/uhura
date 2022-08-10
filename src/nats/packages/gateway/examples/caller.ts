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



    const procedureReq: ProcedureReq = ProcedureReq.create();
    procedureReq.inputs = null;
    procedureReq.procedure = resFindAllDecoded.services[0].procedures[0];
    procedureReq.receiverUhuraId = resFindAllDecoded.services[0].nodeId;
    
    connection.publish(`${uhura_core_id}.callProcedure`, ProcedureReq.encode(procedureReq).finish());
}

bootstrap();