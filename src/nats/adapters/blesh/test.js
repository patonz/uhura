let BleshAdapter = require("@patonz/uhura_device_adapter_blesh");
let port = process.env.DEVICE_PORT;
let remoteAddress = process.env.REMOTE_ADDRESS;
let hostname = process.env.HOSTNAME;
let heartbeatFrequency = process.env.HEARTBEAT_FREQUENCY

if(port === undefined){
    port = '/dev/ttyACM0'
}

if(remoteAddress === undefined){
    remoteAddress = '0xFFFF' //broadcast by default
    console.log(`found remoteHost, all will be sent there: ${remoteAddress}`)
}

if(hostname === undefined){
    hostname = 'tag' //broadcast by default
}

if(heartbeatFrequency === undefined){
    heartbeatFrequency = process.env.heartbeat_FREQUENCY
}

let bleshAdapter = new BleshAdapter(port, hostname, heartbeatFrequency, remoteAddress);
bleshAdapter.eventEmitter.on('message_received', (message)=>{
    console.log('[message received]'+ JSON.stringify(message));
})