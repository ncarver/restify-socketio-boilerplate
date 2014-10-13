//logging
var winston = require('winston');

//string resources
var EMPTY_STRING = '';

//namespace
var SubWS = function (opts) {
    winston.info('SubWS object created');
    this.subscribers = [];
};

function getSocketsById(id, subscribers) {
    var i,
        sockets = [];

    for (i = 0; i < subscribers.length; i = i + 1) {
        if (subscribers[i].id === id) {
            sockets.push(subscribers[i].socket);
        }
    }
    return sockets;
}

//public function to app.js
SubWS.prototype.broadcastData = function (json) {
    winston.verbose('SubWS.broadcastData for subscriberid %s', json.data.subscriberid);

    var socket,
        sockets,
        i;

    //is there a socket subsscribed for this data?
    sockets = getSocketsById(json.data.subscriberid, this.subscribers);
    winston.verbose(' subscribers found for subscriberid %s: %s', json.data.subscriberid, sockets.length);

    for (i = 0; i < sockets.length; i = i + 1) {
        socket = sockets[i];
        socket.emit('any-broadcast', json.data);
    }
    return EMPTY_STRING;
};

SubWS.prototype.processConnection = function (socket) {
    winston.verbose('SubWS.processConnection for socket.id: %s', socket.id);

    socket.emit('SubWS-connect', 'SubWS connection confirmed');
    return EMPTY_STRING;
};

SubWS.prototype.processDisconnect = function (socket) {
    winston.verbose('SubWS.processDisconnect request');

    return this.unsubscribeSocket(socket);
};

SubWS.prototype.unsubscribeSocket = function (socket) {
    winston.verbose('SubWS.unsubscribeSocket for socket.id: %s', socket.id);

    var subscription,
        i;

    for (i = 0; i < this.subscribers.length; i = i + 1) {
        subscription = this.subscribers[i];
        if (subscription.socket === socket) {
            this.subscribers.pop(subscription);
        }
    }
    return (this.subscribers.length);
};

SubWS.prototype.unsubscribeAll = function () {
    winston.verbose('SubWS.unsubscribeAll');

    this.subscribers = [];
    return (this.subscribers.length);
};

SubWS.prototype.subscribeSocket = function (socket, data) {
    winston.verbose('SubWS.subscribeSocket %s for subscriberid %s', socket.id, data.subscriberid);

    this.subscribers.push({'id': data.subscriberid, 'socket': socket});
    return (this.subscribers.length);
};

exports.SubWS = SubWS;