/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var spawn = require('child_process').spawn,
    fs = require('fs'),
    sys = require('sys');

var io = require('socket.io');
var log4js = require('log4js');

var logger = log4js.getLogger();
logger.setLevel('INFO');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var socket = io.listen(http.createServer(app).listen(process.env.PORT || 3000), function(){
  logger.info("Express server listening on port " + app.get('port'));
});

logger.info("Express server listening on port " + app.get('port'));


socket.sockets.on('connection', function(client){
    var connected = true;
    logger.trace("Recevied a connection request from " + client.id);

    client.on('message', function(m){
        logger.debug("Message received " + m + " from " + client.id)
        ssh(client.id, m);
    });

    client.on('disconnect', function(){
        logger.trace("Disconnected " + client.id);
        connected = false;
    });
});


function ssh(clientId, data) {
    var hasPassword = false;
    var commands = data.toString().split("^");
    logger.trace("commands - " + commands.toString());

    logger.debug("About to ssh to " + commands[1] + " and run " + commands[0]);
    var ssh = spawn('ssh', [ commands[1], commands[0]]);

    ssh.stdout.on('data', function (out) {
        logger.debug("Sending to " + clientId + " the output " + out);

        //Send private message only to that client
        socket.sockets.sockets[clientId].send(out);

        if (!hasPassword) {
            logger.trace("Triggered hasPassword - " + hasPassword);

            var stdin = process.openStdin();
            stdin.on('data', function (chunk) {
                ssh.stdin.write(chunk);
            });
        }

        hasPassword = true;
    });

    ssh.stderr.on('data', function (err) {
        logger.error("Error " + err);

        socket.sockets.sockets[clientId].send("ERROR - " + err);
    });
};