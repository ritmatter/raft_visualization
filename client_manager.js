class ClientManager {
    constructor(clientFactory, maxClients, framesBeforeAdd, minClientFrames, maxClientFrames) {
        this.clientFactory = clientFactory;
        this.clientIds = {};
        this.clientFrames = {};
        this.maxClients = maxClients;
        this.framesBeforeAdd = framesBeforeAdd;
        this.minClientFrames = minClientFrames;
        this.maxClientFrames = maxClientFrames;
    }

    handleFrame() {
        if (Object.keys(this.clientIds).length < this.maxClients) {
            if (Math.random() < 1 / this.framesBeforeAdd) {
                this.addClient();
            }
        }

        for (var clientId in this.clientIds) {
            this.clientFrames[clientId]--;
            if (this.clientFrames[clientId] == 0) {
                this.removeClient(clientId);
            }
        }


        for (var clientId in this.clientIds) {
            this.clientIds[clientId].handleFrame();
        };
    }

    addClient() {
        var client = this.clientFactory.get(100, 100);
        client.init();

        this.clientIds[client.id] = client;
        var clientFrames = this.minClientFrames + Math.round(Math.random() * (this.maxClientFrames - this.minClientFrames));
        this.clientFrames[client.id] = clientFrames;
    }

    removeClient(clientId) {
        delete this.clientFrames[clientId];
        this.clientIds[clientId].cleanup();
        delete this.clientIds[clientId];
        console.log("delete client " + clientId);
    }
}

export {
    ClientManager
}