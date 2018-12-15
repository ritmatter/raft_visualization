class Client {
    constructor(id, radius, x, y) {
        this.id = id;
        this.radius = radius;
        this.x = x;
        this.y = y;
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
        this.circle.remove();
    }

    handleFrame() {}

    appear() {}

    disappear() {}

    sendDataRequest() {}

    handleMessage(msg) {}
}

export {
    Client
}