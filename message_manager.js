import {Message} from "./message.js"

class MessageManager {
  constructor(receivers) {
    this.messages = [];
    this.receivers = receivers;
  }

  schedule(message) {
    this.messages.push(message);
  }

  advance() {
    this.messages.forEach(function(message) {
      message.advance();
    });
  }

  checkForArrivals() {
    this.messages.forEach(function(message) {
      var receiver = this.receivers[message.receiver];
      if (receiver.hasCollision(message)) {
        console.log("MESSAGE ARRIVED");
      }
    }.bind(this));
  }
}

export {MessageManager}
