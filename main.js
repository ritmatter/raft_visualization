import {Message} from "./message.js"
import {Replica} from "./replica.js"
import {RequestVoteRequestFactory} from "./request_vote_request.js"
import {RequestVoteResponseFactory} from "./request_vote_response.js"
import {MessageManager} from "./message_manager.js"

var fps = 60;
var time = new Date().getTime();
var interval = 1000 / fps;
var color = "black";
var replica1, replica2, replica3;
var replicaIds = [];
var replicas = {};
var requestVoteRequestFactory;
var requestVoteResponseFactory;
var messageManager;
var delta;

function init() {
  messageManager = new MessageManager(replicas);
  requestVoteRequestFactory = new RequestVoteRequestFactory(10, 2, replicas);
  requestVoteResponseFactory = new RequestVoteResponseFactory(10, 2, replicas);

  replica1 = new Replica('0', 30, 180, 240, replicaIds, requestVoteRequestFactory, requestVoteResponseFactory, messageManager);
  replicaIds.push('0');
  replicas['0'] = replica1;

  replica2 = new Replica('1', 30, 360, 240, replicaIds, requestVoteRequestFactory, requestVoteResponseFactory, messageManager);
  replicaIds.push('1');
  replicas['1'] = replica2;

  replica3 = new Replica('2', 30, 270, 84, replicaIds, requestVoteRequestFactory, requestVoteResponseFactory, messageManager);
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

    messageManager.advance();
    messageManager.deliverArrivals();
  }
};

init();
//replicas['2'].requestVote('0');
//replicas['2'].requestVote('1');
//replicas['1'].requestVote('2');
//replicas['1'].requestVote('0');
//replicas['0'].requestVote('1');
replicas['0'].requestVote('2');
window.requestAnimationFrame(draw);
