let io = require('socket.io-client');
let SimplePeer = require('simple-peer');

class ConnectionManager {
  constructor(url, roomId) {
    this.url = url;
    this.roomId = roomId;
    this.peers = [];
  }

  emit(data) {
    for (let peer of this.peers) {
      peer.send(data);
    }
  }

  connect (payload) {
    var socket = io.connect(this.url);
    var cm = this;

    socket.on('connect', function() {
      console.info('Connected. My socket id is: ' + socket.id);
    });

    socket.on('addPeer', function (data) {
      console.log("New peer: " + data.signer);
      var peer = new SimplePeer({ initiator: true, trickle: false });
      peer.cmKey = [data.initiator, data.signer].sort().join();

      peer.on('signal', function (signal) {
        socket.emit('signSignal', { initiator: data.initiator, signer: data.signer, signal: signal });
      });

      peer.on('connect', function () {
        console.log('Connected to ' + peer.cmKey);
      });

      peer.on('data', function (stuff) {
        console.log('received data: ' + stuff);
      });

      cm.peers.push(peer);
    });

    socket.on('signThis', function (data) {
      console.log('Received signing');
      var peer = new SimplePeer({ trickle: false });
      peer.cmKey = [data.initiator, data.signer].sort().join();

      peer.on('signal', function (signal) {
        socket.emit('finalSign', { initiator: data.initiator, signer: data.signer, signal: signal });
      })

      peer.on('connect', function () {
        console.log('Connected to ' + peer.cmKey);
      });

      peer.on('data', function (stuff) {
        console.log('received data: ' + stuff);
      });

      cm.peers.push(peer);

      peer.signal(data.signal);
    });

    socket.on('finalSignThis', function (data) {
      for (let peer of cm.peers) {
        let cmKey = [data.initiator, data.signer].sort().join();
        if (peer.cmKey === cmKey) {
          peer.signal(data.signal);
        }
      }
    });

    socket.on('removePeer', function (data) {
      let cmKey = [socket.id, data.id].sort().join();
      cm.peers = cm.peers.filter(function (peer) { return peer.cmKey != cmKey });
    });

    return socket;
  }
}

module.exports = {
  io: io,
  SimplePeer: SimplePeer,
  ConnectionManager: ConnectionManager
}
