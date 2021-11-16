var util = require("util");
var SerialPort = require("serialport");
var xbee_api = require("xbee-api");

var C = xbee_api.constants;
const command = "NI";

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1,
});

var serialport = new SerialPort("COM5", {
  baudRate: 9600,
  parser: xbeeAPI.rawParser(),
});
xbeeAPI.builder.pipe(serialport);
serialport.on("open", function () {
  console.log("Serial port open... sending AT%s", command);
  var frame = {
    type: C.FRAME_TYPE.AT_COMMAND,
    command: command,
    commandParameter: [],
  };
 
  serialport.write(xbeeAPI.buildFrame(frame), function (err, res) {
    if (err) throw err;
    else {
        console.log(frame);
        console.log(res);
        console.log("written bytes: " + util.inspect(res));
    } 
  });
  xbeeAPI.builder.write(frame);
});

xbeeAPI.on("frame_object", function (frame) {
  console.log("OBJ> " + util.inspect(frame));
});
xbeeAPI.parser.on("data", function(frame) {
	console.log(">>", frame);
});
