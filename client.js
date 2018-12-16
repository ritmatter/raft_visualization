import {
    Entity
} from "./entity.js"

import {
    DataRequest
} from "./data_request.js"

class Client extends Entity {
    constructor(id, radius, x, y, messageManager, dataRequestFactory, avgFramesBetweenMessages, dataRequestRouter) {
        super(radius);
        this.id = id;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.messageManager = messageManager;
        this.dataRequestFactory = dataRequestFactory;
        this.avgFramesBetweenMessages = avgFramesBetweenMessages;
        this.dataRequestRouter = dataRequestRouter;
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
      var leader = this.dataRequestRouter.getLeader();
      if (leader == null) {
        console.log("Client " + this.id + " skipping data because there is no leader.");
        return;
      }

      var msg = this.dataRequestFactory.get("0", this.id, leader);
      msg.init();
      this.messageManager.schedule(msg);
    }

    handleMessage(msg) {}
}

export {
    Client
}
