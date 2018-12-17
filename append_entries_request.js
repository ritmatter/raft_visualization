import {
    Message,
    MessageFactory
} from "./message.js"

class AppendEntriesRequest extends Message {
    constructor(term, prevLogIndex, prevLogTerm, entries, leaderCommit, radius, x, y, vx, vy, sender, receiver) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.term = term;
        this.prevLogIndex = prevLogIndex;
        this.prevLogTerm = prevLogTerm;
        this.entries = entries;
        this.leaderCommit = leaderCommit;
    }
}

class AppendEntriesRequestFactory extends MessageFactory {
    constructor(radius, v, entities) {
        super(radius, v, entities);
    }

    get(term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit, receiver) {
        var vel = super.getComponentVelocities(leaderId, receiver);
        return new AppendEntriesRequest(term, prevLogIndex, prevLogTerm, entries,
            leaderCommit, this.radius, super.getX(leaderId), super.getY(leaderId), vel[0],
            vel[1], leaderId, receiver);
    }
}

export {
    AppendEntriesRequest,
    AppendEntriesRequestFactory
}