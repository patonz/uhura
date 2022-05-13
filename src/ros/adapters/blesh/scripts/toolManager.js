const fs = require("fs");
const luxon = require("luxon");

class ToolManager {
  dir = "uhura_log/ble_mesh";

  constructor() {
    this.start_timestamp = luxon.DateTime.now().toFormat("dd-MM-yyyy_HH-mm-ss");
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  logToFile(msg, prefix) {
    let default_prefix='net-test';
    if(prefix){
      default_prefix = prefix
    }
    fs.writeFile(
      `uhura_log/ble_mesh/${default_prefix}_${this.start_timestamp}.txt`,
      msg+`\n`,
      { flag: "a+" },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
}

module.exports = new ToolManager();
