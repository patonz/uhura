const Adapter = require("./adapter");

class AdaptersRegistry {
    

    progressiveId = 0; //just a local id for a device adapter
    adapter_list = [];

    registerAdapter(adapter){
        if(adapter instanceof Adapter){
            adapter.id = ""+this.generateAdapterId();
            this.adapter_list.push(adapter);


        }
       return adapter;
    }

    generateAdapterId(){
        this.progressiveId++;
        return this.progressiveId;
    }
}

module.exports = new AdaptersRegistry();