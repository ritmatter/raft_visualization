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

      // TODO: Remove hackiness by making circle configurable.
      this.el.remove();

      this.icon = this.group.append("svg:image")
        .attr("width", 2 * this.radius)
        .attr("height", 2 * this.radius)
        .attr("xlink:href", this.getIconImg());
      this.setImgPosition();
    }

    getIconImg() {
      switch (this.data) {
        case "SPADE":
          return "spade.svg";
        case "CLUB":
          return "club.svg";
        case "DIAMOND":
          return "diamond.svg";
        case "HEART":
          return "heart.svg";
        default:
          throw Error("No image for data type: " + this.data);
          return;
      }
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
