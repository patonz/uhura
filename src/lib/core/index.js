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
        return DevicesRegistry.device_list;
    }

    getLinkStatus(device_id) {
        /**@TODO */
    }

    registerDevice(deviceObj) {
        let device = Object.assign(new Device, deviceObj)
        if (device instanceof Device) {
            return DevicesRegistry.registerDevice(device);

        } else {
            console.error("register device error: input must be a Device instance")
        }

    }

    unregisterDevice(uhura_device_id) {
        /**@TODO */
    }

}

module.exports = new UhuraCore;