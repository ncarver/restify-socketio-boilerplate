/*
SETUP
*/

//required modules
var restify = require('restify'),
    fs = require('fs'),
    socketio = require('socket.io'),
    winston = require('winston');

//set configuration values
var env = process.env.NODE_ENV || 'local',
    settings = require('./settings.json'),
    port = settings[env].port,
    hostname = settings[env].hostname,
    API_PATH = settings.api_path,
    logSettings = settings[env].logs;

//prepare logging
//note winston levels are silly=0(lowest), verbose=1, info=2, warn=3, debug=4, error=5(highest)
winston.remove(winston.transports.Console);
if (logSettings.formatter === 'Console') {
    winston.add(winston.transports.Console, {
        timestamp: true,
        level: logSettings.loglevel
    });
} else {
    winston.add(winston.transports.File, {
        filename: logSettings.logfile,
        timestamp: true,
        level: logSettings.loglevel,
        json: false,
        maxsize: logSettings.logsize
    });
    winston.handleExceptions(new winston.transports.File({
        filename: logSettings.exceptionfile,
        timestamp: true,
        json: false,
        maxsize: logSettings.logsize
    }));
}
winston.info('%s: startup with "%s" settings: ', settings.restify_servername, process.env.NODE_ENV, settings[env]);

//add boilerplate libraries
var PubAPI = new (require('./lib/PubAPI.js').PubAPI)(),
    SubWS = new (require('./lib/SubWS.js').SubWS)();

/*
SERVER SETUP
*/

//create server with qs plugins + socket.io, both setup for CORS
var server = restify.createServer({
    name : settings.restify_servername
});

server.use(restify.CORS({
    origins: ['*'],
    credentials: true
}));
server.use(restify.fullResponse());
server.use(restify.queryParser());

var io = socketio.listen(server.server);
io.set('origins', '*:*');

/*
ROUTING
*/

//route for PubAPI calls from AdService
server.get({path: API_PATH}, function (req, res, cb) {
    winston.verbose('%s: received api request %s', settings.restify_servername, req.url);
    PubAPI.processQuerystring(req.params, function (err, results) {
        if (err !== '') {
            res.send(err);
            winston.warn('%s. Err is: %s. Querystring was: %s', req.url, err, req.url);
        } else {
            var file = __dirname + '/assets/img/pixel.gif';
            fs.stat(file, function (err, stat) {
                if (err) {
                    winston.warn('Err is %s. Filepath was: %s', err, file);
                    res.send(err);
                } else {
                    var img = fs.readFileSync(file);
                    res.contentType = 'image/gif';
                    res.contentLength = stat.size;
                    res.end(img, 'binary');
                }
            });
            SubWS.broadcastData(results);
        }
    });
    cb();
});

//generic router for assets
server.get(/\/js|css|img\/?[\w\W]*/, restify.serveStatic({
    directory: __dirname + '/assets'
}));

//root response
server.get(/\/?[\w\W]*/, restify.serveStatic({
    directory: __dirname + '/assets',
    default: 'index.html'
}));

/*
START SERVERS
*/

//socket server
io.sockets.on('connection', function (socket) {
    winston.verbose('%s: received new socket connected: %s', settings.restify_servername, socket.id);
    SubWS.processConnection(socket);

    socket.on('subscribe', function (data) {
        winston.verbose('%s: new subscription on socket %s. Request: %s', settings.restify_servername, socket.id, JSON.stringify(data));
        SubWS.subscribeSocket(socket, data);
    });

    socket.on('disconnect', function () {
        winston.verbose('%s: socket disconnected: %s', settings.restify_servername, socket.id);
        SubWS.processDisconnect(socket);
    });
});

//rest server
server.listen(process.env.PORT || port, hostname, function () {
    winston.info('%s: %s listening at %s', settings.restify_servername, server.name, server.url);
    winston.info(' current work dir: %s', process.cwd());
    winston.info(' script directory: %s', __dirname);
    winston.info('        this file: %s', __filename);
});
