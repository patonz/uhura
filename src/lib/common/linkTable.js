const dfd = require("danfojs");
const { DataFrame } = require("danfojs/dist/danfojs-base");
const { DateTime } = require("luxon");
class LinkTable {

    link = {};

    maxFrames = 5;
    constructor(maxFrames) {
        this.maxFrames = maxFrames;
    }
    /**
     * 
     * @param {address or remote nodeName} node 
     * @param {frame object like: frame.header, frame.id, frame.sender, frame.rssi, frame.timestamp, frame.cadence} frame 
     * @returns 
     */
    addFrame(node, frame) {

        let df = [
            [frame.header, frame.id, frame.sender, frame.rssi, frame.timestamp, frame.cadence],
        ]

        if (this.link[node] === undefined) {
            this.link[node] = {
                pdr: 0,
                frames: new dfd.DataFrame(df)
            }
            this.link[node].frames.rename({ "0": "header" }, { inplace: true })
            this.link[node].frames.rename({ "1": "id" }, { inplace: true })
            this.link[node].frames.rename({ "2": "sender" }, { inplace: true })
            this.link[node].frames.rename({ "3": "rssi" }, { inplace: true })
            this.link[node].frames.rename({ "4": "timestamp" }, { inplace: true })
            this.link[node].frames.rename({ "5": "cadence" }, { inplace: true })
            //this.link[node].print();
            return
        }
        let dataFrame = this.link[node].frames; //dataFrame of Danfos, frame is a packet.
        if (dataFrame !== undefined && dataFrame instanceof DataFrame) {

            let new_frame = dataFrame.append(df, dataFrame.values.length, { inplace: false });

            if (dataFrame.values.length >= this.maxFrames) {
                new_frame.drop({ index: [0], inplace: true });
                new_frame.resetIndex({ inplace: true });
            }
            this.link[node].frames = new_frame;
            //this.link[node].print();

        }

    }

    /**
     * to be called periodically
     */
    updateAll(){
        for (const [key, value] of Object.entries(this.link)) {
            this.update(key);
          }
    }

    update(node){
        let updateTime = DateTime.now().toMillis();
        let dataFrame = this.link[node].frames
        if(dataFrame !== undefined && dataFrame instanceof DataFrame){
            let cadence = dataFrame['cadence'].values[dataFrame.values.length-1]

            let condition = dataFrame["timestamp"].gt(updateTime-(this.maxFrames*cadence))
            let query = dataFrame.loc({rows: condition});
            this.link[node].pdr = (query.values.length / dataFrame.values.length ) * 100;
            console.log(`${this.link[node].pdr}% with ${query.values.length} of ${dataFrame.values.length}`);
        }
        
    }

}

module.exports = LinkTable;