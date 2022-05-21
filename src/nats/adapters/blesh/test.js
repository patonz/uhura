let BleshAdapter = require("@patonz/uhura_device_adapter_blesh");

let bleshAdapter = new BleshAdapter('/dev/ttyACM1', 'Laptop1');
bleshAdapter.eventEmitter.on('message_received', (message)=>{
    console.log(message);
})
let count = 0;
/*setInterval(() => {
    bleshAdapter.sendMessage(count);
    count++;
}, 5000);*/