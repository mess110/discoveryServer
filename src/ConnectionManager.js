let io = require('socket.io-client');
let SimplePeer = require('simple-peer');

// Holds all the peer connections
module.exports = class ConnectionManager {

  constructor(handlePeerCallback, iceServers) {
    this.iceServers = iceServers;
    this.handlePeerCallback = handlePeerCallback;
    this.peers = [];
  }

  // Send data to all peers
  emit(data) {
    for (let peer of this.peers) {
      if (peer.connected) {
        peer.send(data);
      }
    }
  }

  // Initialize a peer.
  //
  // The peer can be an initiator and uses the iceServers provided
  // in the ConnectionManager constructor.
  //
  // If stream is passed, the SimplePeer will stream the data
  initPeer (initiator, signalCallback, stream = false) {
    var peer = new SimplePeer({
      initiator: initiator,
      config: { iceServers: this.iceServers },
      trickle: false,
      stream: stream
    });

    if (this.handlePeerCallback !== undefined) {
      this.handlePeerCallback(peer)
    }

    peer.on('signal', signalCallback);

    this.peers.push(peer);

    return peer;
  }

  // Connect to a discoveryServer endpoint in a specific room
  //
  // When joining, a socket connection is created. This socket connection
  // is responsible for keeping all the peers connected to each other.
  //
  // When a new socket is created, it emits a 'joinRoom' message which
  // tells the server to instruct all the connected peers to initiate a new
  // connection with the new peer.
  //
  // Example usage:
  //
  // function handlePeer = function (peer) {
  //   peer.on('connect', function () {
  //     console.info('Connected to peer ' + peer.cmKey);
  //   });
  //   peer.on('data', function (data) {
  //     console.log('received data: ' + data);
  //   });
  //   peer.on('stream', function (data) {
  //     console.log('received stream: ' + data);
  //   });
  //   peer.on('close', function () {
  //   });
  // }
  //
  // var cm = new discoveryClient.ConnectionManager(handlePeer,
  //   [ { url: 'stun:stun.l.google.com:19302' } ]);
  // cm.connect('/', 'room');
  //
  connect (url, roomId, stream = false) {
    var socket = io.connect(url);
    var cm = this;

    socket.on('connect', function() {
      console.info('Connected - ' + socket.id);
      socket.emit('joinRoom', { roomId: roomId })
    });

    socket.on('addPeer', function (data) {
      let signBy = data.signBy;
      let initiator = signBy === 'initiator';
      let other = initiator ? 'signer' : 'initiator';

      console.info('Add new peer ' + data[other]);
      var peer = cm.initPeer(initiator, function (signal) {
        socket.emit('sign', {
          initiator: data.initiator,
          signer: data.signer,
          signal: signal,
          signBy: other,
          roomId: roomId
        });
      }, stream)

      peer.cmKey = [data.initiator, data.signer].sort().join();

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

