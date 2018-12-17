class ClientManager {
    constructor(entities, clientFactory, maxClients, framesBeforeAdd, minClientFrames, maxClientFrames, planeLength, replicaPlaneLength, clientRadius) {
        this.entities = entities;
        this.clientFactory = clientFactory;
        this.clientIds = {};
        this.clientFrames = {};
        this.maxClients = maxClients;
        this.framesBeforeAdd = framesBeforeAdd;
        this.minClientFrames = minClientFrames;
        this.maxClientFrames = maxClientFrames;
        this.planeLength = planeLength;
        this.replicaPlaneLength = replicaPlaneLength;
        this.clientRadius = clientRadius;
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
    }

    addClient() {
        var coords = this.getRandomCoordinates();
        var client = this.clientFactory.get(coords[0], coords[1]);
        client.init();

        this.clientIds[client.id] = client;
        var clientFrames = this.minClientFrames + Math.round(Math.random() * (this.maxClientFrames - this.minClientFrames));
        this.clientFrames[client.id] = clientFrames;

        this.entities[client.id] = client;
    }

    getRandomCoordinates() {
        var smallestX = this.clientRadius;
        var largestX = this.planeLength - this.clientRadius;
        var x = Math.round(Math.random() * (largestX - smallestX)) + smallestX;

        var y;
        var replicaBoxTop = this.planeLength / 2 - this.replicaPlaneLength / 2;
        var replicaBoxBottom = replicaBoxTop + this.replicaPlaneLength;
        if (x < replicaBoxTop - this.clientRadius || x > replicaBoxBottom + this.clientRadius) {
            // y can be any number inside the outer box without being in the replica box.
            y = Math.round(Math.random() * (largestX - smallestX)) + smallestX;
        } else {
            // x coordinate vertically intercepts inner box.
            // y must be chosen to avoid the inner box.

            var rand = Math.random();
            if (rand < 0.5) {
                var smallestY = this.clientRadius;
                var largestY = replicaBoxTop - this.clientRadius;
                y = Math.round(Math.random() * (largestY - smallestY)) + smallestY;
            } else {
                var smallestY = replicaBoxTop + this.replicaPlaneLength + this.clientRadius;
                var largestY = this.planeLength - this.clientRadius;;
                y = Math.round(Math.random() * (largestY - smallestY)) + smallestY;
            }
        }
        console.log("Chose coordinates " + x + " and " + y);
        return [x, y];
    }

    removeClient(clientId) {
        delete this.clientFrames[clientId];
        this.clientIds[clientId].cleanup();
        delete this.clientIds[clientId];
        delete this.entities[clientId];
        console.log("delete client " + clientId);
    }
}

export {
    ClientManager
}