import {
    Client
} from "./client.js"

class ClientFactory {
    constructor(radius) {
        this.radius = radius;
    }

    get(x, y) {
        return new Client(this.makeid(), this.radius, x, y);
    }


    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

export {
    ClientFactory
}