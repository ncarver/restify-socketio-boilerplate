//include codecoverage
var blanket = require('blanket')({
    /* options */
    'pattern': '/src/lib/'
});

//prepare assertion and helper libraries
var should = require('should');

//file under test
var SubWS = new (require('../lib/SubWS.js').SubWS)();

//mock object
var io = {};
io.sockets = [];
io.emitCount = 0;
io.reset = function () {
    io.emitCount = 0;
    io.sockets = [];
};
io.getSockets = function () {
    return io.sockets;
};
io.addSocket = function (id, data) {
    var socket = {};
    socket.id = id;
    socket.data = data;
    socket.emit = function (evt, msg) {
        io.emitCount = io.emitCount + 1;
    };
    io.sockets.push(socket);
    return socket;
};
io.emit = function (id, data) {
    io.emitCount = io.emitCount + 1;
};

//constants
var EMPTY_STRING = '';

//test suite
describe('SubWS', function () {

    describe('broadcastData()', function () {
        var data,
            socket;

        beforeEach(function () {
            data = {};
            io.reset();
            SubWS.unsubscribeAll();
            socket = io.addSocket('vIqERMsrHXTpcJwpAAAB', {});
        });

        it('should only send a tracker to a subscribed socket', function () {
            json = {
                'status': 'ok',
                'err': '',
                'data': {
                    'command': 'one',
                    'subscriberid': '1234'
                }
            };

            var subscribers = SubWS.subscribers.length,
                res = SubWS.subscribeSocket(socket, {'subscriberid': '15'});
            res.should.equal(subscribers + 1);

            res = SubWS.broadcastData(json);
            res.should.equal(EMPTY_STRING);
            io.emitCount.should.equal(0);

            res = SubWS.subscribeSocket(socket, {'subscriberid': '1234'});
            res.should.equal(subscribers + 2);

            res = SubWS.broadcastData(json);
            res.should.equal(EMPTY_STRING);
            io.emitCount.should.equal(1);
        });
    });

    describe('subscribeSocket', function () {
        var socket;

        beforeEach(function () {
            socket = io.addSocket({});
        });

        it('should add this socket to the registry', function () {
            var subscribers = SubWS.subscribers.length,
                res = SubWS.subscribeSocket(socket, {'subscriberid': '1234'});
            res.should.equal(subscribers + 1);
        });
    });

    describe('processConnection', function () {
        var socket;

        beforeEach(function () {
            io.reset();
            socket = io.addSocket({});
        });

        it('should emit confirmation back to socket', function () {
            var res = SubWS.processConnection(socket);
            res.should.equal(EMPTY_STRING);
            io.emitCount.should.equal(1);
        });
    });

    describe('processDisconnect', function () {
        var data,
            socket;

        beforeEach(function () {
            io.reset();
            socket = io.addSocket({});
        });

        it('should remove this user to the registry', function () {
            //first add somebody
            data = {'subscriberid': '1234'};
            var res = SubWS.subscribeSocket(socket, data),
                subscribers = SubWS.subscribers.length;

            //then process the disconnect
            res = SubWS.processDisconnect(socket);
            res.should.equal(subscribers - 1);
        });
    });

});