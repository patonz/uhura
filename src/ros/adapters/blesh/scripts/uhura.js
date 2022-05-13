#!/usr/bin/env node
const rosnodejs = require("rosnodejs");
/**
 * Uhura Device Adapter for ROS
 * 
 */
//rosnodejs.loadAllPackages();
const SerialPort = require("serialport");
const ReadLine = require("@serialport/parser-readline");
const fs = require("fs");
const std_msgs = rosnodejs.require("std_msgs").msg;
const BleDevice = require("@patonz/bleshjs");    
const ToolManager = require('./toolManager');

const SendBitsStringData = rosnodejs.require("uhura_device_adapter_blemesh").srv
  .SendBitsStringData;

let messageReceivedPub = undefined;
let hostName = undefined;
let port = "/dev/ttyACM0"; // default port without udev rule. otherwise is /dev/uhura_BLE_NRF_DEVICE_0

// test-ble
let droneAddress = undefined;
let testStarted = false;

function handleDataReceived(data, messageInfo) {
  rosnodejs.log.info(messageInfo);
  rosnodejs.log.debug(data);

  if(data.includes('heartbit:uav')){
    droneAddress = messageInfo.split(" ")[2].replace('<', '').replace('>', '');
    
  }

  if(!testStarted && droneAddress != undefined){
    console.log('eccolo')
    let count = 500;
    rosnodejs.log.info(`sending ${count} packets to ${droneAddress}`)
   
    testStarted = true
    let testProcess =  setInterval(() => {
      if(count > 0){
        BleDevice.sendUnicastMessage(`test:basestation`, (to_log)=>{
          rosnodejs.log.debug(to_log)
        }, droneAddress)
        count--;
      }
 
    }, 500);
    if((count <= 0)){
      clearInterval(testProcess)
    }

  }



  let msg = new std_msgs.String();
  msg.data = data;
  messageReceivedPub.publish(msg);
  ToolManager.logToFile(messageInfo, hostName);
}

async function main() {
  rosnodejs.initNode("/uhura_device_adapter_xbee_node").then(async () => {
    rosnodejs.log.info("uhura device adapter xbee started");

    const nh = rosnodejs.nh;

    const paramPort = `${nh.getNodeName()}/port`;

    const paramHostName = `${nh.getNodeName()}/HOST_NAME`

    messageReceivedPub = nh.advertise(`${nh.getNodeName()}/message_received`, "std_msgs/String");

    if(await nh.hasParam(paramPort)){
      port = await nh.getParam(paramPort);
      rosnodejs.log.info(`found port on params: ${port}`)
    }

    if(await nh.hasParam(paramHostName)){
      hostName = await nh.getParam(paramHostName);
      rosnodejs.log.info(`found hostName on params: ${hostName}`);
    }
  
    BleDevice.prefix_logger = hostName; // will create the file log as <hostName>_<timestamp>.txt
    BleDevice.connect(port); // No automatic System implemented, usually is /dev/uhura_BLE_NRF_DEVICE_0 if udev are loaded correctly
    BleDevice.printUnfilteredData = false
    BleDevice.onReceiveMessage((data, messageInfo) => {
      handleDataReceived(data, messageInfo); // register the handle fun for incoming messages
    });

    let sendMessageService = nh.advertiseService(
      `${nh.getNodeName()}/send_bits_string_data`,
      SendBitsStringData,
      (req, res) => {
        BleDevice.sendMessage(req.data, (toLog) =>{
            console.log(toLog)
            ToolManager.logToFile(toLog, hostName);
        });
        res.success = true;
        return true;
      }
    );
    setTimeout(() => {
      setInterval(() => {
        BleDevice.sendMessage(`heartbit:${hostName}`, (toLog)=>{
            console.log(toLog)
            ToolManager.logToFile(toLog, hostName);
        })
      },10000); /**@TODO params from uhura-core*/
    }, 2000); /**@TODO params from uhura-core*/
  
  });
  return 1;
}

if (require.main === module) {
  // Invoke Main Listener Function
  main();
}
