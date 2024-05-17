const dfd = require("danfojs");
const { DataFrame } = require("danfojs/dist/danfojs-base");
const { DateTime } = require("luxon");
const { evaluate } = require('mathjs');



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
            //console.log(result)
            if (result.pdr >= 0) {
                pdr += result.pdr;
                nodesCount++;
            }

        }
        let result = evaluate(`${pdr} / ${nodesCount}`)
        return isNaN(result) || result === undefined ? 0 : result;
    }

    update(node) {
        const TEN_SECONDS = 10000; // 10 seconds in milliseconds
        let dataFrame = this.link[node].frames;
    
        if (dataFrame !== undefined && dataFrame instanceof DataFrame && dataFrame.values.length > 0) {
            let currentTimestamp = DateTime.now().toMillis();
    
            // Filter the DataFrame for the last 10 seconds
            let conditionReceiver = dataFrame["timestamp"].gt(currentTimestamp - TEN_SECONDS);
            let recentFrames = dataFrame.loc({ rows: conditionReceiver });
    
            // Find the latest cadence that is not undefined
            let lastDefinedCadence;
            for (let i = dataFrame.values.length - 1; i >= 0; i--) {
                if (dataFrame['cadence'].values[i] !== undefined) {
                    lastDefinedCadence = dataFrame['cadence'].values[i];
                    break;
                }
            }
            lastDefinedCadence = lastDefinedCadence || 1000; // Fallback if no defined cadence found
    
            // Calculate expected number of frames
            let expectedFrames = TEN_SECONDS / lastDefinedCadence;
    
            // Calculate PDR
            let pdr = (recentFrames.values.length / expectedFrames) * 100;
            pdr = Math.min(pdr, 100); // Ensure PDR does not exceed 100%
    
            //console.log(`${node}: PDR ${pdr}% with ${recentFrames.values.length} recent frames out of ${expectedFrames} expected frames`);
            return { 
                node: node, 
                pdr: pdr, 
                recentEntries: recentFrames.values.length, 
                expectedEntries: expectedFrames 
            };
        }
    
        return { 
            node: node, 
            pdr: undefined, 
            recentEntries: undefined, 
            expectedEntries: undefined 
        };
    }
    
    
    
    
    
    

}

module.exports = LinkTable;