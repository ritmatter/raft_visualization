import {
    Message,
    MessageFactory
} from "./message.js"

class RequestVoteRequest extends Message {
    constructor(term, lastLogIndex, lastLogTerm, radius, x, y, vx, vy, el, sender, receiver) {
        super(radius, x, y, vx, vy, el, sender, receiver);
        this.term = term;
        this.lastLogIndex = lastLogIndex;
        this.lastLogTerm = lastLogTerm;
    }
}

class RequestVoteRequestFactory extends MessageFactory {
    constructor(radius, v, replicas) {
        super(radius, v, replicas);
    }

    get(term, candidateId, lastLogIndex, lastLogTerm, receiver) {
        var vel = super.getComponentVelocities(candidateId, receiver);
        return new RequestVoteRequest(term, lastLogIndex, lastLogTerm,
            this.radius, super.getX(candidateId), super.getY(candidateId), vel[0],
            vel[1], super.getEl(), candidateId, receiver);
    }
}

export {
    RequestVoteRequest,
    RequestVoteRequestFactory
}