class UhuraMessage {
    type = UhuraMessageType.DEFAULT;
    payload = undefined;
    tag = undefined;
    destination = undefined; // uhura_id
    pathChain = undefined;
    priority = undefined;
    deliveryPolicyList = undefined;

    constructor(){
        
    }

    build(){
        let message = new UhuraMessage();
    }

}

// rethink
const UhuraMessageDeliveryPolicy = {
    AT_LEAST_ONE : 0,
    EXACTLY_ONE : 1,
    BEST_ADAPTER : 2
}


const UhuraMessageType = {
    DEFAULT: 0,
    SERVICE: 1,
    CRITICAL: 2
}

module.exports = UhuraMessage;
module.exports = UhuraMessageType;