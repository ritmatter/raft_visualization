import {
    Message,
    MessageFactory
} from "./message.js"

class AppendEntriesResponse extends Message {
    constructor(term, success, radius, x, y, vx, vy, sender, receiver) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.term = term;
        this.success = success;
    }
}

class AppendEntriesResponseFactory extends MessageFactory {
    constructor(radius, v, replicas) {
        super(radius, v, replicas);
    }

    get(term, success, sender, receiver) {
        var vel = super.getComponentVelocities(sender, receiver);
        return new AppendEntriesResponse(term, success,
            this.radius, super.getX(sender), super.getY(sender), vel[0],
            vel[1], sender, receiver);
    }
}

export {
    AppendEntriesResponse,
    AppendEntriesResponseFactory
}
