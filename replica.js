import {
    Entity
} from "./entity.js"
import {
    RequestVoteRequest
} from "./request_vote_request.js"
import {
    RequestVoteResponse
} from "./request_vote_response.js"
import {
    AppendEntriesRequest
} from "./append_entries_request.js"
import {
    AppendEntriesResponse
} from "./append_entries_response.js"
import {
    DataRequest
} from "./data_request.js"

class Replica extends Entity {
    constructor(id, radius, x, y, replicaIds, requestVoteRequestFactory, requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory, messageManager) {
        super(radius);
        this.id = id;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.replicaIds = replicaIds;
        this.requestVoteRequestFactory = requestVoteRequestFactory;
        this.requestVoteResponseFactory = requestVoteResponseFactory;
        this.appendEntriesRequestFactory = appendEntriesRequestFactory;
        this.appendEntriesResponseFactory = appendEntriesResponseFactory;
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
        this.framesSinceAppendEntries = null;

        // A map from log index to client. This way, the leader can
        // reply when it has finally committed the data.
        this.logIndexToClient = {};

        // Volatile state during an election.
        this.voteCount = 0;

        // Constant for number of frames required to pass before heatbeat.
        this.MAX_FRAMES_SINCE_APPEND_ENTRIES = 120;
    }

    init() {
        this.resetElectionTimer();

        this.group = d3.select("svg").append("g");
        this.circle = this.group.append("circle");
        this.circle.attr("cx", this.x);
        this.circle.attr("cy", this.y);
        this.circle.attr("r", this.radius);
        this.circle.attr("class", "replica follower");

        // Create the arc that surrounds the replica.
        this.arc = d3.arc()
            .innerRadius(30)
            .outerRadius(35)
            .startAngle(0)
            .endAngle(Math.PI);

        this.path = this.group.append("path")
            .attr("class", 'timer-top')
            .attr("d", this.arc)
            .attr("transform", "translate(" + this.x + "," + this.y + ")");
    }

    resetElectionTimer() {
        this.framesInElection = 120 + Math.round(Math.random() * 720);
        this.electionFramesPassed = 0;
    }

    isLeader() {
      return this.nextIndex!= null;
    }

    handleFrame() {
        if (this.isLeader()) {
            this.framesSinceAppendEntries++;
            if (this.framesSinceAppendEntries == this.MAX_FRAMES_SINCE_APPEND_ENTRIES) {
                this.sendHeartbeat();
            }
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
        this.circle.attr("class", "replica candidate");
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

        this.resetElectionTimer();
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
                break;
            case AppendEntriesRequest:
                this.handleAppendEntriesRequest(msg);
                break;
            case AppendEntriesResponse:
                this.handleAppendEntriesResponse(msg);
                break;
            case DataRequest:
                this.handleDataRequest(msg);
                break;
            default:
                break;
        }
    }

    handleDataRequest(msg) {
      // Ignore data requests if we are not the leader.
      // TODO: Consider request forwarding.
      if (!this.isLeader()) {
        return;
      }

      this.log.push(msg.data);

      this.logIndexToClient[this.log.length - 1] = msg.sender;
      this.sendAppendNewEntries([msg.data]);
    }

    handleAppendEntriesRequest(msg) {
        var success = true;
        if (msg.term < this.currentTerm) {
            success = false;
        } else if (msg.prevLogIndex != null && this.log[msg.prevLogIndex] != msg.prevLogTerm) {
            success = false;
        }

        // Update the current term if necessary.
        if (msg.term > this.currentTerm) {
            this.currentTerm = msg.term;
        }

        if (success) {
            var earliestNewIndex = msg.prevLogIndex + 1;
            var latestNewIndex = earliestNewIndex;
            for (var i = 0; i < msg.entries.length; i++) {
                latestNewIndex = earliestNewIndex + i;
                var leaderEntry = msg.entries[i];
                if (latestNewIndex > this.log.length - 1) {
                    // We are beyond the length of our log, add the entry.
                    console.log("Replica " + this.id + " pushed " + leaderEntry + " to log.");
                    this.log.push(leaderEntry);
                } else if (this.log[latestNewIndex] != leaderEntry) {
                    console.log("Replica " + this.id + " found a logs mismatch at index: " + this.latestNewIndex);
                    // There is a mistmatch. Rip out this log entry and all newer.
                    this.log = this.log.slice(0, latestNewIndex);

                    console.log("Replica " + this.id + " pushed " + leaderEntry + " to log.");
                    this.log.push(leaderEntry);
                }
            }

            // Reset the commit index if necessary.
            if (msg.leaderCommit > this.commitIndex) {
                this.commitIndex = Math.min(msg.leaderCommit, latestNewIndex);
                console.log("Replica " + this.id + " set commit index to " + this.commitIndex);
            }

            // Reset the election timer.
            this.resetElectionTimer();
            console.log("Replica " + this.id + " successfully handled append entries.");
        } else {
            console.log("Replica " + this.id + " was unsuccessful appending entries.");
        }

        var res = this.appendEntriesResponseFactory.get(this.currentTerm, success, this.id, msg.sender);
        res.init();
        this.messageManager.schedule(res);
    }

    handleAppendEntriesResponse(msg) {
      console.log("Replica " + this.id + " received append entries response.");
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

        // After deciding whether to grant vote, set the current term if necessary.
        if (msg.term > this.currentTerm) {
            this.currentTerm++;
        }

        var res = this.requestVoteResponseFactory.get(this.currentTerm, voteGranted, this.id, msg.sender);
        res.init();
        this.messageManager.schedule(res);

        // If we casted a positive vote, become a follower and mark vote.
        if (voteGranted) {
            this.circle.attr("class", "replica follower");
            this.nextIndex = null;
            this.matchIndex = null;
            this.framesSinceAppendEntries = null;
            this.votedFor = msg.sender;
        }
        console.log("Replica " + this.id + " became follower and voted for replica " + msg.sender);
    }

    handleRequestVoteResponse(msg) {
        if (msg.voteGranted) {
            this.voteCount++;

            // Become leader if we have received a majority.
            if (this.voteCount > Math.round(this.replicaIds.length / 2 + 0.5)) {
                this.circle.attr("class", "replica leader");

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
                this.sendHeartbeat();
            }
        } else if (msg.term > this.currentTerm) {
            // The replica's term is always set to the largest it has seen.
            this.currentTerm = msg.term;
        }
    }

    sendAppendNewEntries(entries) {
      var prevLogIndex = this.log.length == 0 ? null : this.log.length;
      var prevLogTerm = this.log.length == 0 ? null : this.log[prevLogIndex];

      this.replicaIds.forEach(function(replicaId) {
          // TODO: Generalize this logic instead of repeating it.
          if (replicaId == this.id) {
              return;
          }

          var msg = this.appendEntriesRequestFactory.get(
              this.currentTerm, this.id, prevLogIndex, prevLogTerm, entries, this.commitIndex, replicaId);
          msg.init();
          this.messageManager.schedule(msg);
      }.bind(this));

      this.framesSinceAppendEntries = 0;
    }

    sendHeartbeat() {
      this.sendAppendNewEntries([]);
    }
}

export {
    Replica
}
