//include codecoverage
var blanket = require('blanket')({
    /* options */
    'pattern': '/src/lib/'
});

//prepare assertion and helper libraries
var should = require('should'),
    qs = require('qs');

//file under test
var PubAPI = new (require('../lib/PubAPI.js').PubAPI)();

//constants
var OK_MSG = 'ok',
    EMPTY_STRING = '';

//test suite
describe('PubAPI', function () {

    describe('processQuerystring()', function () {
        var expectedJson,
            querystring,
            params;

        function compareToExpectedJson(err, json) {
            var key;

            err.should.equal(EMPTY_STRING);
            json.status.should.equal(OK_MSG);
            for (key in expectedJson) {
                if (expectedJson.hasOwnProperty(key)) {
                    json.data[key].should.equal(expectedJson[key]);
                }
            }
        }

        beforeEach(function () {
            expectedJson = params = {};
            querystring = '';
        });

        it('should split command into json', function () {
            //note the cb=32711079fc stands for the cache-buster added by OX Crisp AdServer
            querystring = 'subscriberid=1234&command=one&rnd=0.9161366135813296';
            expectedJson = {
                'command': 'one',
                'subscriberid': '1234'
            };

            params = qs.parse(querystring);
            PubAPI.processQuerystring(params, function (err, json) {
                compareToExpectedJson(err, json);
            });
        });

        it('should fail if no command', function () {
            PubAPI.processQuerystring({'subscriberid': '1234'}, function (err, json) {
                err.should.equal('unknown API command');
            });
        });

        it('should fail if no subscriberid', function () {
            PubAPI.processQuerystring({'command': 'one'}, function (err, json) {
                err.should.equal('invalid id or params object');
            });
        });
    });
});