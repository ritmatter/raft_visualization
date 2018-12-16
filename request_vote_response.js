import {
    Message,
    MessageFactory
} from "./message.js"

class RequestVoteResponse extends Message {
    constructor(term, voteGranted, radius, x, y, vx, vy, sender, receiver) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.term = term;
        this.voteGranted = voteGranted;
    }
}

class RequestVoteResponseFactory extends MessageFactory {
    constructor(radius, v, replicas) {
        super(radius, v, replicas);
    }

    get(term, voteGranted, sender, receiver) {
        var vel = super.getComponentVelocities(sender, receiver);
        return new RequestVoteResponse(term, voteGranted,
            this.radius, super.getX(sender), super.getY(sender), vel[0], vel[1], sender, receiver);
    }
}

export {
    RequestVoteResponse,
    RequestVoteResponseFactory
}
