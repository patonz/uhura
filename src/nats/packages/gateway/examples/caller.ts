import { connect } from 'nats';
import { ProcedureReq } from '../src/common/protos/generated';
import { DISCOVERY_FIND_SERVICES_SUBJECT } from '../../uhura-discovery/src/common/constants';
import { FindServicesReq, FindServicesRes } from '../../uhura-discovery/src/common/protos/generated';

/**
 * RUN service.ts BEFORE THIS ONE
 */
async function bootstrap() {
    const uhura_core_id = 'BETA';

    const connection = await connect({ servers: 'nats://0.0.0.0:4222' });

    const reqFindAll = FindServicesReq.encode({}).finish();
    const resFindAll = await connection.request(`${uhura_core_id}:${DISCOVERY_FIND_SERVICES_SUBJECT}`, reqFindAll);
    const resFindAllDecoded = FindServicesRes.decode(resFindAll.data);
    console.log('FindAll', resFindAllDecoded);

    /**
     * thanks to service.ts, we should receive an arraylist of services with one element
     * this service contains a maps of procedures with one procedure only.
     * 
     * */

    let printProcedure;
    for (var prop in resFindAllDecoded.services[0].procedures) {
        // object[prop]
        printProcedure = resFindAllDecoded.services[0].procedures[prop];
        break;
    }


    /**
     * with the procedure descriptor we can call it creating a Procedure Request and send it to the local gateway
     */

    console.log(printProcedure);
    const procedureReq: ProcedureReq = ProcedureReq.create();
    procedureReq.inputs = null; // no input params required
    procedureReq.procedure = printProcedure; // put the procedure descriptor here
    procedureReq.receiverUhuraId = resFindAllDecoded.services[0].nodeId;
    console.log(procedureReq);
    connection.publish(`${uhura_core_id}.callProcedure`, ProcedureReq.encode(procedureReq).finish());


}

bootstrap();