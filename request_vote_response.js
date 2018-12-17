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

    init() {
      super.init();

      // TODO: Remove hackiness by making circle configurable.
      this.el.remove();

      var img = this.voteGranted ? "icons/check.svg" : "icons/x.svg";
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
