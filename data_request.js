import {
    Message,
    MessageFactory
} from "./message.js"

class DataRequest extends Message {
    constructor(data, radius, x, y, vx, vy, sender, receiver) {
        super(radius, x, y, vx, vy, sender, receiver);
        this.data = data;
    }

    init() {
      super.init();

      // TODO: Attempt to make these messages have better data.
      //this.group.append("svg:image")
      //  .attr("width", 2 * this.radius)
      //  .attr("height", 2 * this.radius)
      //  .attr("xlink:href", "spade.svg");
    }
}

class DataRequestFactory extends MessageFactory {
    constructor(radius, v, replicas) {
        super(radius, v, replicas);
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
