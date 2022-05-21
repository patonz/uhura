const events = require('events');
const BleDevice = require("@patonz/bleshjs");
const ToolManager = require('../../common/toolManager');
const LinkTable = require('../../common/linkTable');

/**
 * Generic js class for a blesh adapter
 */
class BleshAdapter {
    log = ToolManager.getLogger('BLESH_ADAPTER');
    hostName = undefined;
    port = "/dev/ttyACM0"; // default port without udev rule. otherwise is /dev/uhura_BLE_NRF_DEVICE_0
    droneAddress = undefined;
    testStarted = false;
    linkTable = new LinkTable();
    eventEmitter = new events.EventEmitter();
    /**
     * 
     * @param {port like '/dev/ttyACM0'} paramPort 
     * @param {blesh name, or machine host name} paramHostName 
     */
    constructor(paramPort, paramHostName) {
        this.start(paramPort, paramHostName);
    }

    start(paramPort, paramHostName) {
        this.log.info("uhura device adapter blesh starting up");

        if (paramPort) {
            this.port = paramPort
            this.log.info(`found port on params: ${this.port}`)
        }

        if (paramHostName) {
            this.hostName = paramHostName
            this.log.info(`found hostName on params: ${this.hostName}`);
        }

        BleDevice.prefix_logger = this.hostName; // will create the file log as <hostName>_<timestamp>.txt
        BleDevice.connect(this.port); // No automatic System implemented, usually is /dev/uhura_BLE_NRF_DEVICE_0 if udev are loaded correctly
        BleDevice.printUnfilteredData = false
        BleDevice.onReceiveMessage((data, messageInfo) => {
            this.handleDataReceived(data, messageInfo); // register the handle fun for incoming messages
        });


        setTimeout(() => {
            setInterval(() => {
                BleDevice.sendMessage(`heartbit:${this.hostName}`, (toLog) => {
                    this.log.debug(toLog);
                    ToolManager.logToFile(toLog, this.hostName);
                })
            }, 10000); /**@TODO params from uhura-core*/
        }, 2000); /**@TODO params from uhura-core*/

    }

    handleDataReceived(data, messageInfo, toLog) {
        this.log.info(messageInfo);
        this.log.debug(data);

        if (data.includes('heartbit:uav')) {
            this.droneAddress = messageInfo.split(" ")[2].replace('<', '').replace('>', '');

        }

        if (!this.testStarted && this.droneAddress != undefined) {
            let count = 500;
            this.log.info(`sending ${count} packets to ${this.droneAddress}`)

            this.testStarted = true
            let testProcess = setInterval(() => {
                if (count > 0) {
                    BleDevice.sendUnicastMessage(`test:basestation`, (to_log) => {
                        this.log.debug(to_log)
                    }, this.droneAddress)
                    count--;
                }

            }, 500);
            if ((count <= 0)) {
                clearInterval(testProcess)
            }

        }

        if(data.includes('heartbit:')){

            this.linkTable.addFrame(messageInfo.sender, messageInfo);
        }



        let message = {
            info: messageInfo,
            data: data
        }

        this.eventEmitter.emit('message_received', message);
        ToolManager.logToFile(toLog, this.hostName);
    }

    /**
     * 
     * @param {data to send} data
     */
    sendMessage(data) {
        BleDevice.sendMessage(data, (toLog) => {
            this.log.debug(toLog);
            ToolManager.logToFile(toLog, this.hostName);
        })
        //feedback?
    }
}

module.exports = BleshAdapter