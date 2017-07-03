var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

class Nurse {
  constructor () {
    this.rooms = {}
  }

  getSockets (roomId) {
    this.default(roomId);
    return this.rooms[roomId];
  }

  addSocket (socket, roomId) {
    this.default(roomId);
    this.rooms.push(socket)
  }

  default (roomId) {
    if (this.rooms[roomId] === undefined) {
      this.rooms[roomId] = []
    }
  }

  toJson () {
    return {};
  }
}

var rooms = {};
var sockets = [];
var nurse = new Nurse();

app.use(express.static(__dirname + '/public'));

app.get('/meta.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(nurse.toJson());
});

io.on('connection', function (socket) {

  socket.on('joinRoom', function (data) {
    for (let s of sockets) {
      s.emit('addPeer', {
        initiator: s.id,
        signer: socket.id,
        signBy: 'initiator',
        roomId: data.roomId
      });
    }
    sockets.push(socket);
  });

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
      target.emit('seal', data);
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

let PORT = process.env.DS_PORT || 1337;
console.log("Listening on port: " + PORT);
server.listen(PORT);
