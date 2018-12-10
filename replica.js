import {RequestVoteRequest} from "./request_vote_request.js"
import {RequestVoteResponse} from "./request_vote_response.js"

class Replica {
  constructor(id, radius, x, y, replicaIds, requestVoteRequestFactory, requestVoteResponseFactory, messageManager) {
    this.id = id;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.replicaIds;
    this.requestVoteRequestFactory = requestVoteRequestFactory;
    this.requestVoteResponseFactory = requestVoteResponseFactory;
    this.messageManager = messageManager;

    // Persistent state.
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];

    // Volatile state.
    this.commitIndex = 0;
    this.lastApplied = 0;

    // Volatile leader state, only set if this replica is the leader.
    this.nextIndex = null;
    this.matchIndex = null;
  }

  init() {
    this.group = d3.select("svg").append("g");
    this.circle = this.group.append("circle");
    this.circle.attr("cx", this.x);
    this.circle.attr("cy", this.y);
    this.circle.attr("r", this.radius);

    // Create the arc that surrounds the replica.
   var arc = d3.arc()
     .innerRadius(30)
     .outerRadius(40)
     .startAngle(0)
     .endAngle(Math.PI);

    this.path = this.group.append("path")
      .attr("class",'base')
      .attr("d", arc)
      .attr("transform", "translate(" + this.x + "," + this.y + ")");
  }

  requestVote(receiver) {
    var lastLogIndex = this.log.length > 0 ? this.log.length - 1 : 0;
    var lastLogTerm = this.log.length > 0 ? this.log[this.log.length -1] : 0;
    var msg = this.requestVoteRequestFactory.get(
      this.term, this.id, lastLogIndex, lastLogTerm, receiver);

    msg.init();
    this.messageManager.schedule(msg);
  }

  handleMessage(msg) {
    switch (msg.constructor) {
      case RequestVoteRequest:
        this.handleRequestVoteRequest(msg);
        break;
      default:
        break;
    }
  }

  handleRequestVoteRequest(msg) {
    var voteGranted;
    if (msg.term < this.currentTerm) {
      // The term provided is too low.
      voteGranted = false;
    } else if (this.votedFor != null && this.votedFor != msg.candidateId) {
      // This replica has already voted for a different candidate.
      voteGranted = false;
    }

    if (this.log[this.log.length - 1] != msg.lastLogEntry) {
      // The last log entries for both are different, the greater index is more up-to-date.
      voteGranted = msg.lastLogIndex > this.log.length - 1;
    } else {
      // The last log entries are the same, the greater index is more up-to-date.
      voteGranted = msg.lastLogIndex >= this.log.length - 1;
    }

    var res = this.requestVoteResponseFactory.get(this.currentTerm, voteGranted, this.id, msg.sender);
    res.init();
    this.messageManager.schedule(res);
  }

  receivedMessage(msg) {
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
