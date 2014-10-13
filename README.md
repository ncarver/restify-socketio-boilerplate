restify-socketio-boilerplate
============================

This is a boilerplate project for building REST-APIs with WebSockets using the Restify and Socket.io Node packages

The intent is to have a very simple web presense because this service is more important to machines.

* The REST API allows machines to send information (publisher)
* The WebSocket (with CORS) allows clients across domains to listen to information changes (subscriber)

Other node modules are included/required
* blanket: confirm code testing coverage
* mocha: unit testing framework
* qs: querystring module integrated with Restify
* restify: of course
* should: unit testing assertion library
* socket.io: yup
* winston: logging


Run application with
"nodemon" to refresh all changes, use "nodemon --debug" to attach node-inspector

Run unit tests with 
"mocha" from the command line, use "mocha --debug-brk" to debug with node-inspector

Run converage report with
mocha -R html-cov > coverage.html