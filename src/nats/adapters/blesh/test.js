let BleshAdapter = require("@patonz/uhura_device_adapter_blesh");

let bleshAdapter = new BleshAdapter('/dev/ttyACM0', 'la0', 1000);
bleshAdapter.eventEmitter.on('message_received', (message)=>{
    console.log('[message received]'+ JSON.stringify(message));
})
let count = 0;
/*setInterval(() => {
    bleshAdapter.sendMessage(count);
    count++;
}, 5000);*/