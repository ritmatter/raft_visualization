import {
    Message
} from "./messages/message.js"

class MessageManager {
    constructor(receivers) {
        this.messages = [];
        this.receivers = receivers;
    }

    schedule(message) {
        this.messages.push(message);
    }

    handleFrame() {
        var undroppedMessages = [];
        this.messages.forEach(function(message) {
            if (message.dropped) {
                message.cleanup();
            } else {
                message.handleFrame();
                undroppedMessages.push(message);
            }
        });
        this.messages = undroppedMessages;
        this.deliverArrivals();
    }

    deliverArrivals() {
        if (this.messages.length == 0) {
            return;
        }

        var inFlightMessages = [];

        // Store all of the current messages in a temporary location.
        // We cannot operate on the messages queue itself because
        // handling the existing messages may add more.
        var tmpMessages = this.messages.slice(0);
        this.messages = [];
        tmpMessages.forEach(function(message) {
            var receiver = this.receivers[message.receiver];
            if (receiver.containsMessage(message)) {
                receiver.handleMessage(message);
                message.cleanup();
            } else {
                inFlightMessages.push(message);
            }
        }.bind(this));

        this.messages = this.messages.concat(inFlightMessages);
    }
}

export {
    MessageManager
}