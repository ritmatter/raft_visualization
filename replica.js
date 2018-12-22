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
    constructor(id, radius, x, y, otherReplicaIds, requestVoteRequestFactory, requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory, messageManager, tableUpdater, minElectionFrames) {
        super(radius);
        this.id = id;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.otherReplicaIds = otherReplicaIds;
        this.requestVoteRequestFactory = requestVoteRequestFactory;
        this.requestVoteResponseFactory = requestVoteResponseFactory;
        this.appendEntriesRequestFactory = appendEntriesRequestFactory;
        this.appendEntriesResponseFactory = appendEntriesResponseFactory;
        this.messageManager = messageManager;
        this.tableUpdater = tableUpdater;
        this.minElectionFrames = minElectionFrames;

        // A map from message ID to message. This is used to correlate
        // responses with their respective requests.
        // TODO: Apply this to all req/res pairs.
        this.pendingRequests = {};

        // Persistent state.
        this.currentTerm = 0;
        this.votedFor = null;

        // Each entry is an array of size 2 with data and term.
        this.log = [];

        // Volatile state.
        this.commitIndex = -1;
        this.lastApplied = -1;

        // Volatile leader state, only set if this replica is the leader.
        this.nextIndex = null;
        this.matchIndex = null;
        this.framesSinceAppendEntries = null;

        // Volatile state during an election.
        this.voteCount = 0;

        this.up = true;

        // Constant for number of frames required to pass before heatbeat.
        this.MAX_FRAMES_SINCE_APPEND_ENTRIES = 360;
    }

    init() {
        this.resetElectionTimer();

        this.group = d3.select("svg").append("g")
            .attr("id", this.id + "-group");

        this.circle = this.group.append("circle");
        this.circle.attr("cx", this.x);
        this.circle.attr("cy", this.y);
        this.circle.attr("r", this.radius);
        this.circle.attr("class", "replica-follower");
        this.circle.attr("id", this.id);

        // Add the label for this replica.
        this.group.append("text")
            .attr("dx", this.x - 8)
            .attr("dy", this.y + 10)
            .attr("class", "replica-label")
            .attr("id", this.id + "-label")
            .text(this.id);

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

        // Bind the function to turn a replica up or down.
        $("#" + this.id + "-group").click(function() {
            this.up = !this.up;
            $("#" + this.id).toggleClass("replica-down");
            $("#" + this.id + "-label").toggleClass("replica-down-label");
        }.bind(this));
    }

    resetElectionTimer() {
        this.framesInElection = this.minElectionFrames + Math.round(Math.random() * this.minElectionFrames);
        this.electionFramesPassed = 0;
    }

    isLeader() {
        return this.up && this.nextIndex != null;
    }

    handleFrame() {
        if (!this.up) {
            return;
        }

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
        this.circle.attr("class", "replica-candidate");
        this.currentTerm++;
        this.votedFor = this.id;
        this.voteCount++;

        // Because messages need to travel in the UI, this is analogous
        // to being in parallel. They are all sent in single frame.
        this.otherReplicaIds.forEach(function(replicaId) {
            this.requestVote(replicaId);
        }.bind(this));

        this.resetElectionTimer();
    }

    requestVote(receiver) {
        var lastLogIndex = this.log.length - 1;
        var lastLogTerm = lastLogIndex > -1 ? this.log[lastLogIndex][1] : 0;
        var msg = this.requestVoteRequestFactory.get(
            this.currentTerm, this.id, lastLogIndex, lastLogTerm, receiver);

        msg.init();
        this.messageManager.schedule(msg);
    }

    handleMessage(msg) {
        if (!this.up) {
            return;
        }

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

        var entry = [msg.data, this.currentTerm];
        this.addToLog(entry);
        this.sendAppendNewEntries([entry]);
    }

    prevEntriesMatch(appendEntriesMsg) {
        var prevLogIndex = appendEntriesMsg.prevLogIndex;
        if (prevLogIndex < 0) {
            return true;
        }

        var prevEntry = this.log[prevLogIndex];
        if (!prevEntry) {
            return false;
        }

        return prevEntry[1] == appendEntriesMsg.prevLogTerm;
    }

    handleAppendEntriesRequest(msg) {
        var success = true;
        if (msg.term < this.currentTerm) {
            success = false;
        } else if (!this.prevEntriesMatch(msg)) {
            success = false;
        }

        // Update the current term if necessary.
        if (msg.term > this.currentTerm) {
            this.currentTerm = msg.term;
            this.becomeFollower();
        }

        if (success) {
            var earliestNewIndex = msg.prevLogIndex + 1;
            var currIndex = earliestNewIndex;
            for (var i = 0; i < msg.entries.length; i++) {
                currIndex = earliestNewIndex + i;
                var currEntry = msg.entries[i];
                if (currIndex > this.log.length - 1) {
                    // We are beyond the length of our log, add the entry.
                    this.addToLog(currEntry);
                } else if (this.log[currIndex][1] != currEntry[1]) {
                    // We have a log entry with the wrong term. Purge the log
                    // up to this point.
                    this.purgeLog(currIndex);
                    this.addToLog(currEntry);
                }
            }

            // Reset the commit index if necessary.
            if (msg.leaderCommit > this.commitIndex) {
                this.setCommitIndex(Math.min(msg.leaderCommit, currIndex));
            }

            // Reset the election timer.
            this.resetElectionTimer();
        }

        var res = this.appendEntriesResponseFactory.get(this.currentTerm, success, this.id, msg.sender, msg.id);
        res.init();
        this.messageManager.schedule(res);
    }

    handleAppendEntriesResponse(msg) {
        var request = this.pendingRequests[msg.requestId];

        // Check if the failure was due to a later term.
        if (msg.term > this.currentTerm) {
            this.currentTerm = msg.term;
            this.becomeFollower();
        }

        if (!this.isLeader()) {
            // Nothing to do if we are not the leader anymore. Skip to the end.
        } else if (!msg.success) {
            // Decrement the nextIndex for this replica and try again.
            // At worst, we will repeat until nextIndex is below zero and reset
            // all log entries for the replica.
            if (this.nextIndex[msg.sender] > 0) {
                this.nextIndex[msg.sender]--;
            }
            this.retryAppendEntries(msg.sender);
        } else {
            // Reset the nextIndex for this replica, since it had the entries.
            // TODO: Figure out if these are exactly correct (probably not).
            var prevLogIndex = request.prevLogIndex != null ? request.prevLogIndex : -1;
            this.nextIndex[msg.sender] = prevLogIndex + request.entries.length + 1;
            this.matchIndex[msg.sender] = prevLogIndex + request.entries.length;

            // Determine if any entries can be committed.
            var numReplicas = this.otherReplicaIds.length + 1;
            var majority = Math.round(numReplicas / 2);
            for (var i = 1; i < request.entries.length + 1; i++) {
                var logIndex = i + prevLogIndex;

                // If at or behind the commit index, then there
                // is nothing to do, since it is already committed.
                if (logIndex <= this.commitIndex) {
                    continue;
                }

                // Only trust messages from this term to commit.
                if (this.log[logIndex] && this.log[logIndex][1] != this.currentTerm) {
                    continue;
                }

                // Count replications, including our own.
                var replications = 1;
                for (var j = 0; j < this.nextIndex.length; j++) {
                    if (j == this.id) {
                        continue;
                    }

                    if (this.matchIndex[j] >= logIndex) {
                        replications++;
                        if (replications >= majority) {
                            this.setCommitIndex(logIndex);
                            break;
                        }
                    }
                }
            }
        }

        // Remove the corresponding request from the pending map.
        delete this.pendingRequests[msg.requestId];
    }

    handleRequestVoteRequest(msg) {
        var voteGranted = true;
        if (msg.term < this.currentTerm) {
            // The term provided is too low.
            voteGranted = false;
        } else if (msg.term == this.currentTerm && this.votedFor != null && this.votedFor != msg.sender) {
            // This replica has already voted for a different candidate in this term.
            voteGranted = false;
        } else if (!this.isCandidateLogUpToDate(msg)) {
            // The candidate's log is not at least as up-to-date as this replica's.
            voteGranted = false;
        }

        // After deciding whether to grant vote, set the current term if necessary.
        if (msg.term > this.currentTerm) {
            this.currentTerm++;
        }

        var res = this.requestVoteResponseFactory.get(this.currentTerm, voteGranted, this.id, msg.sender);
        res.init();
        this.messageManager.schedule(res);

        // If we cast a positive vote, become a follower and mark vote.
        if (voteGranted) {
            this.votedFor = msg.sender;
            this.becomeFollower();
        }
    }

    becomeFollower() {
        this.circle.attr("class", "replica-follower");
        this.nextIndex = null;
        this.matchIndex = null;
        this.framesSinceAppendEntries = null;
    }

    isCandidateLogUpToDate(msg) {
        var len = this.log.length;
        var latestIndex = len == 0 ? 0 : len - 1;
        var latestTerm = len == 0 ? null : this.log[latestIndex][1];

        if (latestTerm != msg.lastLogTerm) {
            // The terms aren't equal to the message must have at least our last term.
            return msg.lastLogTerm >= latestTerm;
        } else {
            // The latest terms are the same so the message must have at least our last index.
            return msg.lastLogIndex >= latestIndex;
        }
    }

    handleRequestVoteResponse(msg) {
        if (msg.voteGranted) {
            this.voteCount++;

            // Become leader if we have received a majority.
            var majority = Math.round((this.otherReplicaIds.length + 1) / 2);
            if (this.voteCount >= majority) {
                this.circle.attr("class", "replica-leader");

                var lastLogIndex = this.log.length - 1;

                this.nextIndex = [0];
                this.matchIndex = [0];
                this.otherReplicaIds.forEach(function(replicaId) {
                    this.nextIndex.push(0);
                    this.matchIndex.push(0);
                }.bind(this));

                var nextIndex = lastLogIndex + 1;
                for (var i = 0; i < this.otherReplicaIds.length; i++) {
                    this.nextIndex[i] = nextIndex;
                };

                // The arc has no value since we are no longer holding elections.
                this.arc.endAngle(0);
                this.path.attr("d", this.arc);

                // Affirm leadership by sending heart beat.
                this.sendHeartbeat();
            }
        } else if (msg.term > this.currentTerm) {
            // The replica's term is always set to the largest it has seen.
            this.currentTerm = msg.term;
        }
    }

    // Retry appending entries for a single replica.
    retryAppendEntries(replicaId) {
        var prevLogIndex = this.nextIndex[replicaId] - 1;
        var prevLogTerm = prevLogIndex < 0 ? null : this.log[prevLogIndex][1];

        var entries = [];
        for (var i = prevLogIndex + 1; i < this.log.length; i++) {
            entries.push(this.log[i]);
        }
        var msg = this.appendEntriesRequestFactory.get(
            this.currentTerm, this.id, prevLogIndex, prevLogTerm, entries, this.commitIndex, replicaId);
        this.pendingRequests[msg.id] = msg;
        msg.init();
        this.messageManager.schedule(msg);
    }

    sendAppendNewEntries(entries) {
        var prevLogIndex = this.log.length < 2 ? -1 : this.log.length - 2;
        var prevLogTerm = prevLogIndex < 0 ? null : this.log[prevLogIndex][1];

        this.otherReplicaIds.forEach(function(replicaId) {
            var msg = this.appendEntriesRequestFactory.get(
                this.currentTerm, this.id, prevLogIndex, prevLogTerm, entries, this.commitIndex, replicaId);
            this.pendingRequests[msg.id] = msg;
            msg.init();
            this.messageManager.schedule(msg);
        }.bind(this));

        this.framesSinceAppendEntries = 0;
    }

    sendHeartbeat() {
        this.sendAppendNewEntries([]);
    }

    setCommitIndex(index) {
        this.commitIndex = index;
        this.tableUpdater.updateCommitIndex(this.id, index);
    }

    addToLog(entry) {
        var data = entry[0];
        var term = entry[1];;
        this.log.push([data, term]);
        this.tableUpdater.insertValue(this.id, this.log.length - 1, term, data);
    }

    purgeLog(newLength) {
        var oldLength = this.log.length;
        this.log = this.log.slice(0, newLength);
        this.tableUpdater.purgeValues(this.id, newLength, oldLength);
    }
}

export {
    Replica
}
