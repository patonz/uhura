const fs = require("fs");
const luxon = require("luxon");
const { createLogger, format, transports, addColors } = require("winston");

class ToolManager {
  dir = "/data/uhura_log/ble_mesh";

  logTag = undefined;


  logLevels = {
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5
    },
    colors: {
      fatal: 'purple',
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      trace: 'orange'
    }
  };


  myFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message} `
    // Check if the message is already an object
    if (typeof message === 'object' && message !== null) {
      msg += JSON.stringify(message);
    } else {
      msg += message;
      // Check if metadata has any own properties
      if (Object.keys(metadata).length > 0) {
        // Convert metadata to a string if it's not empty
        const metadataStr = JSON.stringify(metadata);
        // Append metadata string to the message
        msg += ' ' + metadataStr;
      }
    }

    return msg
  });


  constructor() {
    addColors(this.logLevels.colors)
    this.start_timestamp = luxon.DateTime.now().toFormat("dd-MM-yyyy_HH-mm-ss");
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  logToFile(msg, prefix) {
    let default_prefix = 'net-test';
    if (prefix) {
      default_prefix = prefix
    }
    fs.writeFile(
      `${this.dir}/${default_prefix}_${this.start_timestamp}.txt`,
      msg + `\n`,
      { flag: "a+" },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
  getLogger(tag) {
    if (this.logTag == undefined) {
      this.logTag = tag;
    }

    let logger = createLogger({
      levels: this.logLevels.levels,
      level: 'debug',
      format: format.combine(format.label({ label: this.logTag, message: true }), format.timestamp(), format.splat(), format.colorize(), this.myFormat), //format.json()
      transports: [new transports.Console()],
    });

    return logger;
  }
}

module.exports = new ToolManager();
