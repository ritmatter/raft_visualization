import {
    Entity
} from "./entity.js"

import {
    DataRequest
} from "./data_request.js"

class Client extends Entity {
    constructor(id, radius, x, y, messageManager, dataRequestFactory, avgFramesBetweenMessages) {
        super(radius);
        this.id = id;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.messageManager = messageManager;
        this.dataRequestFactory = dataRequestFactory;
        this.avgFramesBetweenMessages = avgFramesBetweenMessages;
    }

    init() {
        this.group = d3.select("svg").append("g");

        this.circle = this.group.append("circle");
        this.circle.attr("cx", this.x);
        this.circle.attr("cy", this.y);
        this.circle.attr("r", this.radius);
        this.circle.attr("class", "client");
    }

    cleanup() {
        this.group.remove();
    }

    handleFrame() {
      if (Math.random() < 1 / this.avgFramesBetweenMessages) {
        this.sendDataRequest();
      }
    }

    appear() {}

    disappear() {}

    sendDataRequest() {
      var msg = this.dataRequestFactory.get("0", this.id, "2");
      msg.init();
      this.messageManager.schedule(msg);
    }

    handleMessage(msg) {}
}

export {
    Client
}
