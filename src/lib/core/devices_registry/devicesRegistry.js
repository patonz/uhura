const Device = require("./device");

class DevicesRegistry {
    

    progressiveId = 0; //just a local id for a device adapter
    device_list = [];

    registerDevice(device){
        if(device instanceof Device){
            device.id = ""+this.generateDeviceId();
            this.device_list.push(device);


        }
       return device;
    }

    generateDeviceId(){
        this.progressiveId++;
        return this.progressiveId;
    }
}

module.exports = new DevicesRegistry();