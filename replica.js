class Replica {
  constructor(id, radius, x, y, el, replicaIds, requestVoteRequestFactory, messageManager) {
    this.id = id;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.el = el;
    this.replicaIds;
    this.requestVoteRequestFactory = requestVoteRequestFactory;
    this.messageManager = messageManager;

    // Persistent state.
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];

    // Volatile state.
    this.commitIndex = 0;
    this.lastApplied = 0;

    // Leader state, only set if this replica is the leader.
    this.nextIndex = null;
    this.matchIndex = null;
    this.isLeader = false;
  }

  init() {
    this.el.attr("cx", this.x);
    this.el.attr("cy", this.y);
    this.el.attr("r", this.radius);
  }

  requestVote(receiver) {
    var msg = this.requestVoteRequestFactory.getRequestVoteRequest(
      this.term, this.id, this.log.length - 1, this.log[this.log.length - 1], receiver);

    msg.init();
    this.messageManager.schedule(msg);
  }

  hasCollision(msg) {
    var dx = this.x - msg.x;
    var dy = this.y - msg.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + msg.radius) {
      return true;
    }
    return false;
  }
}

export {Replica}
