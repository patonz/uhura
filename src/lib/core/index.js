const Device = require("./devices_registry/device");
const DevicesRegistry = require("./devices_registry/devicesRegistry");

class UhuraCore {

    constructor() {

    }

    sendMessage(msg) {
        console.log(`message sent ${msg}`)
    }

    receiveMessageCallback() {

    }

    getDeviceList() {

    }

    getLinkStatus() {

    }

    registerDevice(device) {
        if(device instanceof Device){
            DevicesRegistry.registerDevice(device);
        } else {
            console.error("register device error: input must be a Device instance")
        }
        
    }

    unregisterDevice(uhura_device_id) {

    }


}

module.exports = new UhuraCore;