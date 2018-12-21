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
        this.circle.attr("id", this.id);
        this.circle.attr("display", "none");
        this.appear();
    }

    cleanup() {
        this.disappear();
        window.setTimeout(function() {
         this.group.remove();
        }.bind(this), 1520);
    }

    handleFrame() {
        if (Math.random() < 1 / this.avgFramesBetweenMessages) {
            this.sendDataRequest();
        }
    }

    appear() {
      $("#" + this.id).fadeIn(1500);
    }

    disappear() {
      $("#" + this.id).fadeOut(1500);
    }

    sendDataRequest() {
        var leader = this.dataRequestRouter.getLeader();
        if (leader == null) {
            console.log("Client " + this.id + " skipping data because there is no leader.");
            return;
        }

        var dataTypes = ["SPADE", "CLUB", "HEART", "DIAMOND"];
        var dataType = dataTypes[Math.round(Math.random() * (dataTypes.length - 1))];
        var msg = this.dataRequestFactory.get(dataType, this.id, leader);
        msg.init();
        this.messageManager.schedule(msg);
    }

    handleMessage(msg) {}
}

export {
    Client
}
