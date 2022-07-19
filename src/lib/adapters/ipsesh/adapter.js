const events = require("events");
const IpsDevice = require("@patonz/ipseshjs/script/index");
const ToolManager = require("../../common/toolManager");
const LinkTable = require("../../common/linkTable");

/**
 * Generic js class for a Ipsesh adapter
 */
class IpseshAdapter {
  log = ToolManager.getLogger("IPSESH_ADAPTER");
  local_ip //binds of socket udp
  port // spawn a default port @TODO
  cadence
  broadcastIp // let ipsesh to find it
  hostName
  interface // wlan0 for example
  framesForLink
  linkTable
  eventEmitter = new events.EventEmitter();

  opt(options, name, defaultValue) {
    return options && options[name] !== undefined
      ? options[name]
      : defaultValue;
  }

  /**
   *
   * @param {*} options.interface "wlan0"
   * @param {*} options.port "2222 as default"
   * @param {*} options.hostName "robot name"
   * @param {*} options.cadence "heartbeat cadence"
   * @param {*} options.broadcastIp "address for heartbeat, default 255.255.255.255"
   * @param {*} options.framesForLink "default 5"
   */
  constructor(options) {

    this.interface = this.opt(options, 'interface', 'eth0');
    this.port = this.opt(options, 'port', 2222);
    this.hostName = this.opt(options, 'hostName', 'host');
    this.cadence = this.opt(options, 'cadence', 2000);
    this.broadcastIp = this.opt(options, 'broadcastIp', IpsDevice.broadcastIp);
    this.framesForLink = this.opt(options, 'framesForLink', 5);




    this.linkTable = new LinkTable(this.framesForLink);

    this.start(this.interface, this.hostName, this.cadence);
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

    if (paramHostName) {
      this.hostName = paramHostName;
      this.log.info(`found hostName on params: ${this.hostName}`);
    }

    // BleDevice.prefix_logger = this.hostName; // will create the file log as <hostName>_<timestamp>.txt
    IpsDevice.connect(this.interface, this.port); // 0.0.0.0 and 2222 for example to bind udp4
    //BleDevice.printUnfilteredData = false;
    IpsDevice.onReceiveMessage((msg, info) => {
      this.handleDataReceived(msg, info); // register the handle fun for incoming messages
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
    this.log.info(msg.toString());
    this.log.debug(JSON.stringify(info));

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
