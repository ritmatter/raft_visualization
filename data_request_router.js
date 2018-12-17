// Routes data requests to the replica leader.
// This implementation simply applies the proper
// receiver to the message.
class DataRequestRouter {
    constructor(replicas) {
        this.replicas = replicas;
    }

    getLeader() {
        for (var i = 0; i < this.replicas.length; i++) {
            var replica = this.replicas[i];
            if (replica.isLeader()) {
                return replica.id;
            }
        }
        return null;
    }
}

export {
    DataRequestRouter
}