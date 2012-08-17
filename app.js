
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
  console.log("Express server listening on port " + app.get('port'));
});


socket.sockets.on('connection', function(client){
    var connected = true;

    //On receiving the message event - echo to console
    client.on('message', function(m){
        ssh(m);
    });

    client.on('disconnect', function(){
        connected = false;
    });
});


function ssh(data) {
    var hasPassword = false;
    var commands = data.toString().split("^");
    process.stdout.write(commands[0] + " : " + commands[1]);
    var ssh = spawn('ssh', [ commands[1], commands[0]]);

    ssh.stdout.on('data', function (out) {
        process.stdout.write(out);
        socket.of("").send(out);
        if (!hasPassword) {
            var stdin = process.openStdin();
            stdin.on('data', function (chunk) {
                ssh.stdin.write(chunk);
            });
        }

        hasPassword = true;
    });

    ssh.stderr.on('data', function (err) {
        process.stdout.write(err);
        socket.of("").send(err);
    });
};