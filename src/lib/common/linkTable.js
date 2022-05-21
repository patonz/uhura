const dfd = require("danfojs-node");
const { DataFrame } = require("danfojs-node/dist/danfojs-base");
class LinkTable {

    link = {};

    constructor() {

    }

    addFrame(node, frame){

        let df = [
            [frame.header, frame.id, frame.id, frame.sender, frame.rssi],
        ]

        if(this.link[node] === undefined){
            this.link[node] = new dfd.DataFrame(df);
            this.link[node].print();
            return
        }
        let dataFrame = this.link[node];
        if(dataFrame !== undefined && dataFrame instanceof DataFrame){
            let new_frame = dataFrame.append(df, dataFrame.values.length, {inplace: false});
            this.count++;
            this.link[node] = new_frame;
            this.link[node].print();
            
        }

    }

}

module.exports = LinkTable;