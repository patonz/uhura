const events = require("events");
const IpsDevice = require("@patonz/ipseshjs/script/index")
const ToolManager = require("../../common/toolManager");
const LinkTable = require("../../common/linkTable");

/**
 * Generic js class for a Ipsesh adapter
 */
class IpseshAdapter {
  log = ToolManager.getLogger("IPSESH_ADAPTER");
  local_ip = "0.0.0.0";
  local_port = "2222"; // spawn a default port @TODO

  broadcast_ip = IpsDevice.broadcastIp; // let ipsesh to find it

  interface = undefined; // wlan0 for example

  linkTable = undefined;
  eventEmitter = new events.EventEmitter();

  /**
   *
   * @param {*} paramInterface "wlan0"
   * @param {*} paramHostName "robot name"
   * @param {*} cadence "heartbeat cadence"
   * @param {*} remoteHost "address for heartbeat, default 255.255.255.255"
   * @param {*} framesForLink "default 5"
   */
  constructor(
    paramInterface,
    paramHostName,
    cadence,
    broadcast_ip,
    framesForLink
  ) {
    this.linkTable = new LinkTable(framesForLink);
    this.start(paramInterface, paramHostName, cadence, remoteHost);
  }

  /**
   *
   * @param {*} paramPort
   * @param {*} paramHostName
   * @param {*} cadence
   * @param {*} remoteHost // for heartbeat only
   */
  start(paramInterface, paramHostName, cadence, remoteHost) {
    this.log.info("uhura device adapter ipsesh starting up");

    if (paramPort) {
      this.port = paramPort;
      this.log.info(`found port on params: ${this.port}`);
    }

    if (paramHostName) {
      this.hostName = paramHostName;
      this.log.info(`found hostName on params: ${this.hostName}`);
    }

    // BleDevice.prefix_logger = this.hostName; // will create the file log as <hostName>_<timestamp>.txt
    IpsDevice.connect(this.interface, this.local_port); // 0.0.0.0 and 2222 for example to bind udp4
    //BleDevice.printUnfilteredData = false;
    IpsDevice.onReceiveMessage((msg, info) => {
      this.handleDataReceived(data, messageInfo, toLog); // register the handle fun for incoming messages
    });

    /**
     * heartbeat
     */

    if (cadence === undefined) {
      cadence = 2000;
    }

    setTimeout(() => {
      setInterval(() => {
        this.linkTable.updateAll();

        if (remoteHost !== undefined) {
          // check if the heartbeat should go on remote host only.
        } else {
          IpsDevice.sendMessageBroadcast("im alive");
        }
      }, cadence); /**@TODO params from uhura-core*/
    }, 2000); /**@TODO params from uhura-core*/
  }

  handleDataReceived(msg, info) {
    this.log.info(msg);
    this.log.debug(info);

    this.eventEmitter.emit("message_received", msg);
    //ToolManager.logToFile(toLog, this.hostName);
  }

  /**
   *
   * @param {data to send} data
   */
  sendMessage(msg) {
    IpsDevice.sendMessageBroadcast(msg);
    //feedback?
  }
}

module.exports = IpseshAdapter;
