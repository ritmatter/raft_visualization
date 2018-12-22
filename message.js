// Base message class.
class Message {
    constructor(radius, x, y, vx, vy, sender, receiver) {
        this.id = this.makeid();
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.sender = sender;
        this.receiver = receiver;
    }

    makeid() {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    init() {
        this.group = d3.select("svg").append("g");

        this.el = this.group.append("circle");
        this.el.attr("cx", this.x);
        this.el.attr("cy", this.y);
        this.el.attr("r", this.radius);
    }

    cleanup() {
        this.group.remove();
    }

    handleFrame() {
        // Advances x and y coordinates by one iteration.
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        this.el.attr("cx", this.x);
        this.el.attr("cy", this.y);
    }
}

// Base factory for creating message objects.
class MessageFactory {
    constructor(radius, v, jitter, entities) {
        // By default all messages have the same radius.
        this.radius = radius;

        // By default all messages have the same velocity, representing
        // network latency. random jitter could be added here to be more
        // real.
        this.v = v;

        // The max amount of jitter in velocity. The velocity for each msg
        // will be the base v plus some random amount of jitter.
        this.jitter = jitter;

        // A map of Id to entity. Each entity has x and y coordinates that
        // are used to direct messages.
        this.entities = entities;
    }

    getComponentVelocities(sender, receiver) {
        var sender = this.entities[sender];
        var receiver = this.entities[receiver];

        var sx = sender.x;
        var sy = sender.y;
        var rx = receiver.x;
        var ry = receiver.y;

        var dx = rx - sx;
        var dy = ry - sy;
        var theta = Math.atan(Math.abs(dy / dx));

        var v = this.v + (Math.random() * this.jitter);
        var vx = v * Math.cos(theta);
        var vy = v * Math.sin(theta);
        if (dx < 0) {
            vx *= -1;
        }
        if (dy < 0) {
            vy *= -1;
        }
        return [vx, vy];
    }

    getX(entityId) {
        return this.entities[entityId].x;
    }

    getY(entityId) {
        return this.entities[entityId].y;
    }
}

export {
    Message,
    MessageFactory
}