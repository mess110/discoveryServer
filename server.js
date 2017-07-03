var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var rooms = [];
var sockets = [];

app.use(express.static(__dirname + '/public'));

app.get('/meta.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({}))
});

io.on('connection', function (socket) {
  // The newly connected socket is the signer
  for (let s of sockets) {
    s.emit('addPeer', { initiator: s.id, signer: socket.id });
  }
  sockets.push(socket);

  socket.on('signSignal', function (data) {
    var signer = undefined;
    for (let s of sockets) {
      if (s.id === data.signer) {
        signer = s;
      }
    }
    if (signer === undefined) {
      console.error('signer not found ' + data.signer);
      return;
    }

    signer.emit('signThis', data);
  });

  socket.on('finalSign', function (data) {
    var initiator = undefined;
    for (let s of sockets) {
      if (s.id === data.initiator) {
        initiator = s;
      }
    }
    if (initiator === undefined) {
      console.error('initiator not found ' + data.initiator);
      return;
    }

    initiator.emit('finalSignThis', data);
  });

  socket.on('disconnect', function () {
    var oldId = socket.id;
    var index = sockets.indexOf(socket);
    sockets.splice(index, 1);
    for (let s of sockets) {
      s.emit('removePeer', { id: oldId });
    }
  });
});

PORT = 8421;
console.log("Listening on port: " + PORT);
server.listen(PORT);
