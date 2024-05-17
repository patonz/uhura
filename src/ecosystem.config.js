const UHURA_CORE_ID = process.env.UHURA_CORE_ID
const NATS_SERVER = process.env.NATS_SERVER_ADDRESS
const SYNC_DELAY = process.env.SYNC_DELAY
const TEST = process.env.TEST
const MAX_NODES = process.env.MAX_NODES
const NODES = process.env.NODES
module.exports = {
  apps: [{
    name: "core",
    script: './nats/core/index.js',
    env: {
      ID: `${UHURA_CORE_ID}`,
      NATS_SERVER_ADDRESS: `${NATS_SERVER}`,
      DEBUG: false
    },
  }, {
    name: "adapter_nats",
    script: './nats/adapters/direct/index.js',
    env: {
      ID: `${UHURA_CORE_ID}`,
      NATS_SERVER_ADDRESS: `${NATS_SERVER}`,
      DEBUG: false
    },
  }, 
  /*{
    name: "gateway",
    script: 'npm',
    cwd: "./nats/packages/gateway/",
    args:"run start",
    env: {
      NATS_SERVER: "0.0.0.0:4222",
      UHURA_CORE_ID: `${UHURA_CORE_ID}`
    },
  }, 
  {
    name: "discovery",
    script: 'npm',
    cwd:"./nats/packages/uhura-discovery/",
    args:"run start",
    env: {
      NATS_SERVER: "0.0.0.0:4222",
      UHURA_CORE_ID: `${UHURA_CORE_ID}`,
      SYNC_DELAY: `${SYNC_DELAY}`,
      TEST: `${TEST}`,
      MAX_NODES: `${MAX_NODES}`,
      NODES: `${NODES}`
    },
  }*/
],
};
