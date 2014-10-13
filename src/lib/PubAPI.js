//logging
var winston = require('winston');

//string resources
var OK = 'ok',
    ERR = 'err',
    EMPTY_STRING = '',
    UNKNOWN_CMD = 'unknown API command',
    INVALID_ID = 'invalid id or params object';

//namespace
var PubAPI = function (opts) {
    winston.info('PubAPI object created');
};

//private helpers to PubAPI
function processCommand1(params) {
    winston.verbose(' processCommand1');

    var json = {};
    json.data = params;
    json.status = OK;
    json.err = EMPTY_STRING;
    return json;
}

function processCommand2(params) {
    winston.verbose(' processCommand2');

    var json = {};
    json.data = params;
    json.status = OK;
    json.err = EMPTY_STRING;
    return json;
}

function processUnknown(params) {
    winston.verbose(' processUnknown');

    var json = {};
    json.data = params;
    json.status = ERR;
    json.err = UNKNOWN_CMD;
    return json;
}

function processInvalid(params) {
    winston.verbose(' processInvalid');

    var json = {};
    json.data = params;
    json.status = ERR;
    json.err = INVALID_ID;
    return json;
}


//public function to app.js
PubAPI.prototype.processQuerystring = function (params, cb) {
    winston.verbose('PubAPI.processQuerystring');

    var json = {},
        errMsg = EMPTY_STRING;

    if (params && params.subscriberid) {
        switch (params.command) {
        case 'one':
            json = processCommand1(params);
            break;
        case 'two':
            json = processCommand2(params);
            break;
        default:
            json = processUnknown(params);
        }
    } else {
        json = processInvalid(params);
    }

    if (json.status !== OK) {
        errMsg = json.err;
    }

    return (cb(errMsg, json));
};

exports.PubAPI = PubAPI;