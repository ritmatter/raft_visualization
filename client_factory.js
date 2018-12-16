import {
    Client
} from "./client.js"

class ClientFactory {
    constructor(radius, messageManager, dataRequestFactory, avgFramesBetweenMessages) {
        this.radius = radius;
        this.messageManager = messageManager;
        this.dataRequestFactory = dataRequestFactory;
        this.avgFramesBetweenMessages = avgFramesBetweenMessages;
    }

    get(x, y) {
        return new Client(this.makeid(), this.radius, x, y, this.messageManager, this.dataRequestFactory,
          this.avgFramesBetweenMessages);
    }

    makeid() {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

export {
    ClientFactory
}
