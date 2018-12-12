import {
    RequestVoteRequest
} from "./request_vote_request.js"
import {
    RequestVoteResponse
} from "./request_vote_response.js"

class Replica {
    constructor(id, radius, x, y, replicaIds, requestVoteRequestFactory, requestVoteResponseFactory, messageManager) {
        this.id = id;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.replicaIds = replicaIds;
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

        // Volatile state during an election.
        this.voteCount = 0;
    }

    init() {
        this.framesInElection = 120 + Math.round(Math.random() * 720);
        this.electionFramesPassed = 0;

        this.group = d3.select("svg").append("g");
        this.circle = this.group.append("circle");
        this.circle.attr("cx", this.x);
        this.circle.attr("cy", this.y);
        this.circle.attr("r", this.radius);

        // Create the arc that surrounds the replica.
        this.arc = d3.arc()
            .innerRadius(30)
            .outerRadius(40)
            .startAngle(0)
            .endAngle(Math.PI);

        this.path = this.group.append("path")
            .attr("class", 'base')
            .attr("d", this.arc)
            .attr("transform", "translate(" + this.x + "," + this.y + ")");
    }

    handleFrame() {
        // Do nothing if we are already the leader.
        if (this.nextIndex != null) {
            return;
        }

        var endAngle = 2 * Math.PI - (2 * Math.PI * this.electionFramesPassed / this.framesInElection);
        this.arc.endAngle(endAngle);
        this.path.attr("d", this.arc);

        if (this.electionFramesPassed == this.framesInElection) {
            this.beginElection();
        } else {
            this.electionFramesPassed++;
        }
    }

    beginElection() {
        this.currentTerm++;
        this.votedFor = this.id;
        this.voteCount++;

        // Because messages need to travel in the UI, this is analogous
        // to being in parallel. They are all sent in single frame.
        this.replicaIds.forEach(function(replicaId) {
            if (replicaId == this.id) {
                return;
            }

            this.requestVote(replicaId);
        }.bind(this));

        // Finally, reset the election timer.
        this.framesInElection = 120 + Math.round(Math.random() * 720);
        this.electionFramesPassed = 0;
    }

    requestVote(receiver) {
        var lastLogIndex = this.log.length > 0 ? this.log.length - 1 : 0;
        var lastLogTerm = this.log.length > 0 ? this.log[this.log.length - 1] : 0;
        var msg = this.requestVoteRequestFactory.get(
            this.currentTerm, this.id, lastLogIndex, lastLogTerm, receiver);

        msg.init();
        this.messageManager.schedule(msg);
    }

    handleMessage(msg) {
        switch (msg.constructor) {
            case RequestVoteRequest:
                this.handleRequestVoteRequest(msg);
                break;
            case RequestVoteResponse:
                this.handleRequestVoteResponse(msg);
            default:
                break;
        }
    }

    handleRequestVoteRequest(msg) {
        var voteGranted;
        if (msg.term < this.currentTerm) {
            // The term provided is too low.
            voteGranted = false;
        } else if (msg.term == this.currentTerm && this.votedFor != null && this.votedFor != msg.sender) {
            // This replica has already voted for a different candidate.
            voteGranted = false;
        } else if (this.log[this.log.length - 1] != msg.lastLogEntry) {
            // The last log entries for both are different, the greater index is more up-to-date.
            voteGranted = msg.lastLogIndex > this.log.length - 1;
        } else {
            // The last log entries are the same, the greater index is more up-to-date.
            voteGranted = msg.lastLogIndex >= this.log.length - 1;
        }

        var res = this.requestVoteResponseFactory.get(this.currentTerm, voteGranted, this.id, msg.sender);
        res.init();
        this.messageManager.schedule(res);

        // If we casted a positive vote, become a follower and mark vote.
        this.nextIndex = null;
        this.matchIndex = null;
        this.votedFor = msg.sender;
        console.log("Replica " + this.id + " became follower and voted for replica " + msg.sender);
    }

    handleRequestVoteResponse(msg) {
        if (msg.voteGranted) {
            this.voteCount++;

            // Become leader if we have received a majority.
            if (this.voteCount > Math.round(this.replicaIds.length / 2 + 0.5)) {
                var lastLogIndex = this.log.length == 0 ? 0 : this.log.length - 1;
                this.nextIndex = [];
                this.matchIndex = [];
                this.replicaIds.forEach(function(replicaId, lastLogIndex) {
                    this.nextIndex.push(lastLogIndex + 1);
                    this.matchIndex.push(0);
                }.bind(this));

                // The arc has no value since we are no longer holding elections.
                this.arc.endAngle(0);
                this.path.attr("d", this.arc);

                // Affirm leadership by sending heart beat.
                console.log("Replica " + this.id + " became leader in term " + this.currentTerm);
            }
        } else if (msg.term > this.currentTerm) {
            // The replica's term is always set to the largest it has seen.
            this.currentTerm = msg.term;
        }
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
    Replica
}