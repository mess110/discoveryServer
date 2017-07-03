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
    s.emit('addPeer', { initiator: s.id, signer: socket.id, signBy: 'initiator' });
  }
  sockets.push(socket);

  socket.on('sign', function (data) {
    var target = undefined;
    for (let s of sockets) {
      if (s.id === data[data.signBy]) {
        target = s;
      }
    }

    if (target === undefined) {
      console.error(data.signBy + ' not found ' + data[data.signBy]);
      return;
    }

    if (data.signBy === 'signer') {
      target.emit('addPeer', data);
    } else {
      target.emit('establish', data);
    }
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
