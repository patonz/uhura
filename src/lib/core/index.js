const Adapter = require("./adapters_registry/adapter");
const AdaptersRegistry = require("./adapters_registry/adaptersRegistry");

class UhuraCore {

    constructor() {

    }

    sendMessage(msg) {
        console.log(`message sent ${msg}`)
    }

    receiveMessageCallback() {

    }

    getAdapterList() {
        return AdaptersRegistry.adapter_list;
    }
    getAdapterByRequest(request){

    }

    getLinkStatus(adapter_id) {
        /**@TODO */
    }

    registerAdapter(adapterObj) {
        let adapter = Object.assign(new Adapter, adapterObj)
        if (adapter instanceof Adapter) {
            return AdaptersRegistry.registerAdapter(adapter);

        } else {
            console.error("register adapter error: input must be a Adapter instance")
        }

    }

    unregisterAdapter(adapter_id) {
        /**@TODO */
    }

}

module.exports = new UhuraCore;