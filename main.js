import {
    TableUpdater
} from "./table_updater.js"
import {
    Replica
} from "./replica.js"
import {
    DataRequestFactory
} from "./messages/data_request.js"
import {
    DataRequestRouter
} from "./data_request_router.js"
import {
    RequestVoteRequestFactory
} from "./messages/request_vote_request.js"
import {
    RequestVoteResponseFactory
} from "./messages/request_vote_response.js"
import {
    AppendEntriesRequestFactory
} from "./messages/append_entries_request.js"
import {
    AppendEntriesResponseFactory
} from "./messages/append_entries_response.js"
import {
    MessageManager
} from "./message_manager.js"
import {
    ClientManager
} from "./client_manager.js"
import {
    ClientFactory
} from "./client_factory.js"

var paused = false;
var FPS = 60;
var time = new Date().getTime();
var interval = 1000 / FPS;
var color = "black";

var replica1, replica2, replica3;

var replicas = [] // A list of the replicas.
var entities = {}; // A map from entity ID to entity.

var tableUpdater;
var requestVoteRequestFactory;
var requestVoteResponseFactory;
var appendEntriesRequestFactory;
var appendEntriesResponseFactory;
var dataRequestFactory;
var dataRequestRouter;
var messageManager;
var clientManager;
var clientFactory;
var delta;

// The length of a square that encapsulates the entire animation space.
var BOX_LENGTH = 400;

// The length of a square that encapsulates all of the replicas.
var REPLICA_BOX_LENGTH = 300;

// Padding to apply to the outside of the replica box so that clients
// do not appear directly next to a replica.
var REPLICA_BOX_PADDING = 20;

// The radius of an individual replica.
var REPLICA_RADIUS = 30;

var MESSAGE_RADIUS = 16;

var MSG_PIXELS_PER_F = 8; // Base pixels per frame before jitter.

var MSG_PIXELS_PER_F_MAX_JITTER = 4; // Pixels per frame max jitter.

// Parameters for clients.
var CLIENT_RADIUS = 20;
var AVG_FRAMES_BETWEEN_DATA = 180;
var MAX_CLIENTS = 1;
var AVG_FRAMES_BETWEEN_CLIENTS = 60;
var MIN_CLIENT_FRAME_LIFE = 600;
var MAX_CLIENT_FRAME_LIFE = 900;

function init() {
    $("#animation-holder").height(BOX_LENGTH);
    $("#animation-holder").width(BOX_LENGTH);

    tableUpdater = new TableUpdater(3);
    tableUpdater.init();

    // Initialize the size of the SVG plane.
    var svg = d3.select("svg");
    var animationCenter = BOX_LENGTH / 2;
    var replicaCircleRadius = REPLICA_BOX_LENGTH / 2 - REPLICA_RADIUS - REPLICA_BOX_PADDING;
    var triangleSide = replicaCircleRadius * Math.sqrt(3);

    var coordsTop = [animationCenter, animationCenter - replicaCircleRadius];
    var bottomY = animationCenter + (triangleSide * Math.sqrt(3) / 2 - replicaCircleRadius);
    var coordsBl = [animationCenter - triangleSide / 2, bottomY];
    var coordsBr = [animationCenter + triangleSide / 2, bottomY];

    // Election time must be much greater than message send time.
    // We calibrate for the simulation assuming one req-res pair
    // takes 10ms and the election period is 150-300ms.
    var pixelsBetweenReplicas = coordsBr[0] - coordsBl[0];
    var reqResLatencyFrames = pixelsBetweenReplicas / (MSG_PIXELS_PER_F_MAX_JITTER / 2 + MSG_PIXELS_PER_F) * 2;
    var minElectionFrames = Math.round((reqResLatencyFrames * 15));

    dataRequestRouter = new DataRequestRouter(replicas);
    messageManager = new MessageManager(entities, dataRequestRouter);
    requestVoteRequestFactory = new RequestVoteRequestFactory(MESSAGE_RADIUS, MSG_PIXELS_PER_F, MSG_PIXELS_PER_F_MAX_JITTER, entities);
    requestVoteResponseFactory = new RequestVoteResponseFactory(MESSAGE_RADIUS, MSG_PIXELS_PER_F, MSG_PIXELS_PER_F_MAX_JITTER, entities);

    appendEntriesRequestFactory = new AppendEntriesRequestFactory(MESSAGE_RADIUS, MSG_PIXELS_PER_F, MSG_PIXELS_PER_F_MAX_JITTER, entities);
    appendEntriesResponseFactory = new AppendEntriesResponseFactory(MESSAGE_RADIUS, MSG_PIXELS_PER_F, MSG_PIXELS_PER_F_MAX_JITTER, entities);

    dataRequestFactory = new DataRequestFactory(MESSAGE_RADIUS, MSG_PIXELS_PER_F, MSG_PIXELS_PER_F_MAX_JITTER, entities);

    clientFactory = new ClientFactory(CLIENT_RADIUS, messageManager, dataRequestFactory, AVG_FRAMES_BETWEEN_DATA, dataRequestRouter);
    clientManager = new ClientManager(entities, clientFactory, MAX_CLIENTS, AVG_FRAMES_BETWEEN_CLIENTS, MIN_CLIENT_FRAME_LIFE, MAX_CLIENT_FRAME_LIFE, BOX_LENGTH, REPLICA_BOX_LENGTH, CLIENT_RADIUS, dataRequestRouter);

    replica1 = new Replica(0, REPLICA_RADIUS, coordsBl[0], coordsBl[1], [1, 2], requestVoteRequestFactory,
        requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory,
        messageManager, tableUpdater, minElectionFrames);
    entities[0] = replica1;
    replicas.push(replica1);
    replica1.init();

    replica2 = new Replica(1, REPLICA_RADIUS, coordsBr[0], coordsBr[1], [0, 2], requestVoteRequestFactory,
        requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory,
        messageManager, tableUpdater, minElectionFrames);
    entities[1] = replica2;
    replicas.push(replica2);
    replica2.init();

    replica3 = new Replica(2, REPLICA_RADIUS, coordsTop[0], coordsTop[1], [0, 1], requestVoteRequestFactory,
        requestVoteResponseFactory, appendEntriesRequestFactory, appendEntriesResponseFactory,
        messageManager, tableUpdater, minElectionFrames);
    entities[2] = replica3;
    replicas.push(replica3);
    replica3.init();
}

function draw() {
    if (paused) {
        return;
    }

    window.requestAnimationFrame(draw);

    var now = new Date().getTime();
    delta = now - time;

    if (delta > interval) {
        time = now;

        messageManager.handleFrame();
        clientManager.handleFrame();

        Object.keys(entities).forEach(function(entityId) {
            entities[entityId].handleFrame();
        });

    }
};

// Implement a rudimentary pause button for debugging.
$(document).ready(function() {
    $("#pause-button").click(function() {
        paused = !paused;
        if (!paused) {
            window.requestAnimationFrame(draw);
        }
    });
    init();
    window.requestAnimationFrame(draw);
});
