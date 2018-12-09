// Base message class.
class Message {
  constructor(id, radius, x, y, vx, vy, el, sender, receiver) {
    this.id = id;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.el = el;
    this.sender = sender;
    this.receiver = receiver;
  }

  init() {
    this.el.attr("cx", this.x);
    this.el.attr("cy", this.y);
    this.el.attr("r", this.radius);
  }

  advance() {
    // Advances x and y coordinates by one iteration.
    this.x = this.x + this.vx;
    this.y = this.y + this.vy;
    this.el.attr("cx", this.x);
    this.el.attr("cy", this.y);
  }
}

// Base factory for creating message objects.
class MessageFactory {
  constructor(radius, v, replicas) {
    // By default all messages have the same radius.
    this.radius = radius;

    // By default all messages have the same velocity, representing
    // network latency. Random jitter could be added here to be more
    // real.
    this.v = v;

    // A map from replicaId to replica. Each replica's information
    // is used to determine component velocities.
    this.replicas = replicas;
  }

  getComponentVelocities(sender, receiver) {
    var sender = this.replicas[sender];
    var receiver = this.replicas[receiver];

    var sx = sender.x;
    var sy = sender.y;
    var rx = receiver.x;
    var ry = receiver.y;

    var dx = rx - sx;
    var dy = ry - sy;
    var theta = Math.atan(dy / dx);
    return [this.v * Math.cos(theta), this.v * Math.sin(theta)];
  }

  getX(replicaId) {
    return this.replicas[replicaId].x;
  }

  getY(replicaId) {
    return this.replicas[replicaId].y;
  }

  getEl() {
    return d3.select("svg").append("circle");
  }
}

export {Message, MessageFactory}
