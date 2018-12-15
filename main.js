import {
    Message
} from "./message.js"
import {
    Replica
} from "./replica.js"
import {
    RequestVoteRequestFactory
} from "./request_vote_request.js"
import {
    RequestVoteResponseFactory
} from "./request_vote_response.js"
import {
    AppendEntriesRequestFactory
} from "./append_entries_request.js"
import {
    AppendEntriesResponseFactory
} from "./append_entries_response.js"
import {
    MessageManager
} from "./message_manager.js"
import {
    ClientManager
} from "./client_manager.js"
import {
    ClientFactory
} from "./client_factory.js"

var fps = 60;
var time = new Date().getTime();
var interval = 1000 / fps;
var color = "black";
var replica1, replica2, replica3;
var replicaIds = [];
var replicas = {};
var requestVoteRequestFactory;
var requestVoteResponseFactory;
var appendEntriesRequestFactory;
var appendEntriesResponseFactory;
var messageManager;
var clientManager;
var clientFactory;
var delta;

function init() {
    messageManager = new MessageManager(replicas);
    requestVoteRequestFactory = new RequestVoteRequestFactory(8, 8, replicas);
    requestVoteResponseFactory = new RequestVoteResponseFactory(8, 8, replicas);

    appendEntriesRequestFactory = new AppendEntriesRequestFactory(8, 8, replicas);
    appendEntriesResponseFactory = new AppendEntriesResponseFactory(8, 8, replicas);

    clientFactory = new ClientFactory(20);
    clientManager = new ClientManager(clientFactory, 1, 30, 100, 200);

    replica1 = new Replica('0', 30, 180, 240, replicaIds, requestVoteRequestFactory,
        requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory,
        messageManager);
    replicaIds.push('0');
    replicas['0'] = replica1;

    replica2 = new Replica('1', 30, 360, 240, replicaIds, requestVoteRequestFactory,
        requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory,
        messageManager);
    replicaIds.push('1');
    replicas['1'] = replica2;

    replica3 = new Replica('2', 30, 270, 84, replicaIds, requestVoteRequestFactory,
        requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory,
        messageManager);
    replicaIds.push('2');
    replicas['2'] = replica3;

    Object.keys(replicaIds).forEach(function(replicaId) {
        replicas[replicaId].init();
    });
}

function draw() {
    window.requestAnimationFrame(draw);

    var now = new Date().getTime();
    delta = now - time;

    if (delta > interval) {
        time = now;

        Object.keys(replicaIds).forEach(function(replicaId) {
            replicas[replicaId].handleFrame();
        });

        messageManager.handleFrame();
        clientManager.handleFrame();
    }
};

init();
window.requestAnimationFrame(draw);