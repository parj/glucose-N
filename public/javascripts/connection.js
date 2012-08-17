var hostname = 'http://' + document.location.hostname;
var socket = io.connect(hostname);

function sendMessage() {
    var boolOK = sanityCheck();
    if (boolOK)
        socket.send(document.getElementById('txtCommand').value);
}

function sanityCheck() {
    var command = document.getElementById('txtCommand').value;
    var boolOK = true;
    var error = "";

    if (command.indexOf("@") == -1) {
        boolOK = false;
        error = " Missing @,";
    } if (command.indexOf("^") == -1) {
        boolOK = false;
        error += " Missing ^,";
    } if (command.indexOf("@") == 0) {  //No text before @
        boolOK = false;
        error += " No text before @,";
    } if (command.indexOf("^") == 0) {  //No text before @
        boolOK = false;
        error += " No text before ^,";
    }

    if (!boolOK) {
        document.getElementById('divError').setAttribute("class", "control-group error");
        document.getElementById('btnCommand').setAttribute("class", "btn btn-danger");
        document.getElementById('txtHelp').textContent = error;

    } else {
        document.getElementById('divError').setAttribute("class","control-group");
        document.getElementById('btnCommand').setAttribute("class", "btn btn-primary");
        document.getElementById('txtHelp').textContent = "";
    }

    return boolOK;
}

socket.on('message', function(data){
    document.getElementById('txtResult').value += data;
    document.getElementById('txtResult').value += "\n-----EOL-----\n\n";
});