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
      console.info('Connected - ' + socket.id);
    });

    socket.on('addPeer', function (data) {
      let signBy = data.signBy;
      let initiator = signBy === 'initiator';
      let other = initiator ? 'signer' : 'initiator';
      console.info('Add new peer ' + data[other]);

      var peer = new SimplePeer({ initiator: initiator, trickle: false });
      peer.cmKey = [data.initiator, data.signer].sort().join();

      peer.on('signal', function (signal) {
        socket.emit('sign', { initiator: data.initiator, signer: data.signer, signal: signal, signBy: other });
      });

      peer.on('connect', function () {
        console.info('Connected to peer ' + peer.cmKey);
      });

      peer.on('data', function (stuff) {
        console.log('received data: ' + stuff);
      });

      peer.on('close', function () {
      });

      cm.peers.push(peer);

      if (initiator === false) {
        peer.signal(data.signal);
      }
    });

    socket.on('establish', function (data) {
      for (let peer of cm.peers) {
        let cmKey = [data.initiator, data.signer].sort().join();
        if (peer.cmKey === cmKey) {
          peer.signal(data.signal);
        }
      }
    });

    socket.on('removePeer', function (data) {
      let cmKey = [socket.id, data.id].sort().join();
      console.info('Removing peer ' + cmKey);
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
