const dfd = require("danfojs");
const { DataFrame } = require("danfojs/dist/danfojs-base");
const { DateTime } = require("luxon");



/**
 * @typedef {Object} LinkTable
 * @property {function(number): undefined} constructor - Create a LinkTable.
 * @property {function(string, Object): undefined} addFrame - Adds a frame to the link table.
 * @property {function(): undefined} updateAll - Periodically updates all nodes in the link table.
 * @property {function(string): Object} update - Updates a specific node in the link table.
 */
class LinkTable {

    link = {};

    maxFrames = 5;
    /**
     * 
     * @param {number} maxFrames 
     */
    constructor(maxFrames) {
        this.maxFrames = maxFrames;
    }
    /**
     * 
     * @param {address/remote: nodeName} node 
     * @param {{frame.header, frame.id, frame.sender, frame.rssi, frame.timestamp, frame.cadence} frame 
     * @returns 
     */
    addFrame(node, frame) {


        if (!frame.timestamp) {
            frame.timestamp = DateTime.now().toMillis();
        }

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
     * 
     * @returns {pdr} final pdr
     */
    updateAll() {
        let pdr = 0;
        let nodesCount = 0;
        for (const [key, value] of Object.entries(this.link)) {
            let result = this.update(key);
            console.log(result)
            if (result.pdr >= 0) {
                pdr += result.pdr;
                nodesCount++;
            }

        }

        return pdr / nodesCount;
    }

    update(node) {
        let updateTime = DateTime.now().toMillis();
        let dataFrame = this.link[node].frames
        if (dataFrame !== undefined && dataFrame instanceof DataFrame) {
            let cadence = dataFrame['cadence'].values[dataFrame.values.length - 1]

            let condition = dataFrame["timestamp"].gt(updateTime - (this.maxFrames * cadence))
            let query = dataFrame.loc({ rows: condition });
            this.link[node].pdr = (query.values.length / dataFrame.values.length) * 100;
            console.log(`${node}: pdr ${this.link[node].pdr}% with ${query.values.length} of ${dataFrame.values.length}`);
            return { node: node, pdr: this.link[node].pdr, entries: query.values.length, maxEntries: dataFrame.values.length }
        }

        return { node: node, pdr: undefined, entries: undefined, maxEntries: undefined }

    }

}

module.exports = LinkTable;