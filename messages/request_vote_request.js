import {
    Message,
    MessageFactory
} from "./message.js"

class RequestVoteRequest extends Message {
    constructor(term, lastLogIndex, lastLogTerm, radius, x, y, vx, vy, sender, receiver) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.term = term;
        this.lastLogIndex = lastLogIndex;
        this.lastLogTerm = lastLogTerm;
    }

    init() {
        super.init();

        // TODO: Remove hackiness by making circle configurable.
        this.el.remove();

        this.icon = this.group.append("svg:image")
            .attr("width", 2 * this.radius)
            .attr("height", 2 * this.radius)
            .attr("xlink:href", "icons/question.svg");
        this.setImgPosition();
    }

    setImgPosition() {
        var imgX = this.x - this.radius;
        var imgY = this.y - this.radius;
        this.icon.attr(
            "transform", "translate(" + imgX + ", " + imgY + ")");
    }

    handleFrame() {
        super.handleFrame();
        this.setImgPosition();
    }

}

class RequestVoteRequestFactory extends MessageFactory {
    constructor(radius, v, jitter, replicas) {
        super(radius, v, jitter, replicas);
    }

    get(term, candidateId, lastLogIndex, lastLogTerm, receiver) {
        var vel = super.getComponentVelocities(candidateId, receiver);
        return new RequestVoteRequest(term, lastLogIndex, lastLogTerm,
            this.radius, super.getX(candidateId), super.getY(candidateId), vel[0],
            vel[1], candidateId, receiver);
    }
}

export {
    RequestVoteRequest,
    RequestVoteRequestFactory
}