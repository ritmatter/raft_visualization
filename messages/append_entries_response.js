import {
    Message,
    MessageFactory
} from "./message.js"

class AppendEntriesResponse extends Message {
    constructor(term, success, radius, x, y, vx, vy, sender, receiver, requestId) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.term = term;
        this.success = success;
        this.requestId = requestId;
    }

    init() {
        super.init();

        // TODO: Remove hackiness by making circle configurable.
        this.el.remove();

        var img = this.success ? "icons/check.svg" : "icons/x.svg";
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

class AppendEntriesResponseFactory extends MessageFactory {
    constructor(radius, v, jitter, replicas) {
        super(radius, v, jitter, replicas);
    }

    get(term, success, sender, receiver, requestId) {
        var vel = super.getComponentVelocities(sender, receiver);
        return new AppendEntriesResponse(term, success,
            this.radius, super.getX(sender), super.getY(sender), vel[0],
            vel[1], sender, receiver, requestId);
    }
}

export {
    AppendEntriesResponse,
    AppendEntriesResponseFactory
}