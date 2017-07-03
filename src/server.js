var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
let packageJson = require('../package.json');
let Nurse = require('./Nurse');
var nurse = new Nurse();

app.use(express.static(__dirname + '/../public'));

app.get('/rooms.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(nurse.toJson());
});

io.on('connection', function (socket) {

  socket.on('joinRoom', function (data) {
    let allRoomSockets = nurse.getSockets(data.roomId);
    for (let s of allRoomSockets) {
      s.emit('addPeer', {
        initiator: s.id,
        signer: socket.id,
        signBy: 'initiator',
        roomId: data.roomId
      });
    }
    nurse.addSocket(socket, data.roomId);
  });

  socket.on('sign', function (data) {
    var target = undefined;
    for (let s of nurse.getSockets(data.roomId)) {
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
    let result = nurse.removeSocket(socket);
    for (let roomKey of result.rooms) {
      for (let s of nurse.getSockets(roomKey)) {
        s.emit('removePeer', { id: result.id });
      }
    }
  });
});

let PORT = process.env.DS_PORT || 1337;
console.log('discoveryServer v' + packageJson.version);
console.log("Listening on port: " + PORT);
server.listen(PORT);
