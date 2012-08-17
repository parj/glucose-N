var hostname = 'http://' + document.location.hostname;
var socket = io.connect(hostname);

function sendMessage() {
    socket.send(document.getElementById('txtCommand').value);
}

socket.on('message', function(data){
    document.getElementById('txtResult').value += data;
    document.getElementById('txtResult').value += "----------\n";
});

