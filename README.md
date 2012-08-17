# glucose-N
### glucose (https://github.com/parj/glucose) rewritten in Node.js

Currently a simple application that runs on Unix, Linux and Mac. Spawns a ssh process to connect and uses WebSockets to pipe back information

### Pre-Requisites
`npm install` or `npm install expressjs socket.io log4js jade`

### To start the app
`node app.js`

### To use
Head to http://localhost:3000/ and to run a command type `ls -lrt^foo@localhost`

You can even string multiple commands together `uname -a;ps -ef | grep node^foo@localhost`