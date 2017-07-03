let io = require('socket.io-client');
let SimplePeer = require('simple-peer');

class ConnectionManager {

  // Example usage:
  //
  // new discoveryClient.ConnectionManager(undefined, roomId, function (peer) {
  //   peer.on('connect', function () {
  //     console.info('Connected to peer ' + peer.cmKey);
  //   });
  //   peer.on('data', function (stuff) {
  //     console.log('received data: ' + stuff);
  //   });
  //   peer.on('stream', function (stuff) {
  //     console.log('received stream: ' + stuff);
  //   });
  //   peer.on('close', function () {
  //   });
  // });
  //
  //
  // url - of the discovery server
  // iceServers - [ { url: 'stun:stun.l.google.com:19302' } ]
  constructor(url, roomId, addPeerCallback, iceServers, stream = false) {
    this.url = url;
    this.roomId = roomId;
    this.stream = stream;
    this.iceServers = iceServers;
    this.addPeerCallback = addPeerCallback;
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
      socket.emit('joinRoom', { roomId: cm.roomId })
    });

    socket.on('addPeer', function (data) {
      let signBy = data.signBy;
      let initiator = signBy === 'initiator';
      let other = initiator ? 'signer' : 'initiator';
      console.info('Add new peer ' + data[other]);

      var peer = new SimplePeer({
        initiator: initiator,
        config: { iceServers: cm.iceServers },
        trickle: false,
        stream: cm.stream
      });
      peer.cmKey = [data.initiator, data.signer].sort().join();

      peer.on('signal', function (signal) {
        socket.emit('sign', {
          initiator: data.initiator,
          signer: data.signer,
          signal: signal,
          signBy: other,
          roomId: cm.roomId
        });
      });

      if (cm.addPeerCallback !== undefined) {
        cm.addPeerCallback(peer)
      }

      cm.peers.push(peer);

      if (initiator === false) {
        peer.signal(data.signal);
      }
    });

    socket.on('seal', function (data) {
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
