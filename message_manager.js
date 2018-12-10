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

  deliverArrivals() {
    for (var i = this.messages.length - 1; i > -1; i--) {
      var message = this.messages[i];
      var receiver = this.receivers[message.receiver];
      if (receiver.receivedMessage(message)) {
        this.messages.splice(i);
        receiver.handleMessage(message);
        message.cleanup();
      }
    }
  }
}

export {MessageManager}
