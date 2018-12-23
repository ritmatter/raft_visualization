import {
    Message,
    MessageFactory
} from "./message.js"
import {
    getDataIcon
} from "../utils/utils.js"

class DataRequest extends Message {
    constructor(data, radius, x, y, vx, vy, sender, receiver) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.data = data;
    }

    init() {
        super.init();

        // TODO: Remove hackiness by making circle configurable.
        this.el.remove();

        this.icon = this.group.append("svg:image")
            .attr("width", 2 * this.radius)
            .attr("height", 2 * this.radius)
            .attr("xlink:href", getDataIcon(this.data));
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

class DataRequestFactory extends MessageFactory {
    constructor(radius, v, jitter, replicas) {
        super(radius, v, jitter, replicas);
    }

    get(data, sender, receiver) {
        var vel = super.getComponentVelocities(sender, receiver);
        return new DataRequest(data, this.radius, super.getX(sender), super.getY(sender), vel[0],
            vel[1], sender, receiver);
    }
}

export {
    DataRequest,
    DataRequestFactory
}
