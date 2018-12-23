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

    init() {
        super.init();

        // TODO: Remove hackiness by making circle configurable.
        this.el.remove();

        var img = this.entries.length > 0 ? "icons/data.svg" : "icons/heartbeat.svg";
        this.icon = this.group.append("svg:image")
            .attr("width", 2 * this.radius)
            .attr("height", 2 * this.radius)
            .attr("xlink:href", img);
        this.setImgPosition();
    }

    handleFrame() {
        super.handleFrame();
        this.setImgPosition();
    }

    setImgPosition() {
        var imgX = this.x - this.radius;
        var imgY = this.y - this.radius;
        this.icon.attr(
            "transform", "translate(" + imgX + ", " + imgY + ")");
    }

}

class AppendEntriesRequestFactory extends MessageFactory {
    constructor(radius, v, jitter, replicas) {
        super(radius, v, jitter, replicas);
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
