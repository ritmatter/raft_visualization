class Entity {
  constructor(radius) {
    this.radius = radius;
  }

  containsMessage(msg) {
      var dx = this.x - msg.x;
      var dy = this.y - msg.y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.radius + msg.radius) {
          return true;
      }
      return false;
  }
}

export {
  Entity
}
