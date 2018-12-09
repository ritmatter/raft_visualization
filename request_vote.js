import {Message, MessageFactory} from "./message.js"

class RequestVoteRequest extends Message {
  constructor(term, candidateId, lastLogIndex, lastLogTerm, radius, x, y, vx, vy, el, sender, receiver) {
    // TODO: Actually provide a unique identifier per message.
    super("foo", radius, x, y, vx, vy, el, sender, receiver);
    this.term = term;
    this.candidateId = candidateId;
    this.lastLogIndex = lastLogIndex;
    this.lastLogTerm = lastLogTerm;
  }
}

class RequestVoteResponse extends Message {
  constructor(term, voteGranted, radius, x, y, vx, vy, el, sender, receiver) {
    super(radius, x, y, vx, vy, el, sender, receiver);
    this.term = term;
    this.voteGranted = voteGranted;
  }
}

class RequestVoteRequestFactory extends MessageFactory {
  constructor(radius, v, replicas) {
    super(radius, v, replicas);
  }

  getRequestVoteRequest(term, candidateId, lastLogIndex, lastLogTerm, receiver) {
    var vel = super.getComponentVelocities(candidateId, receiver);
    return new RequestVoteRequest(term, candidateId, lastLogIndex, lastLogTerm,
      this.radius, super.getX(candidateId), super.getY(candidateId), vel[0],
      vel[1], super.getEl(), candidateId, receiver);
  }
}

export {RequestVoteRequest, RequestVoteResponse, RequestVoteRequestFactory}
