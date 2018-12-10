var cm;
var classes = ["one","two","three","four","five","six","seven","eight"];
var clients = 1;

function getFullId(id) {
  return `video-${id}`
}

function init() {
  let container = document.getElementById('container');

  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function(stream) {
    initRTC(stream);
  }).catch(function(err) {
    console.log(err)
    initRTC(false);
  });

  function findOrCreateVideo(id) {
    let container = document.getElementById('container');
    container.className = classes[clients-1];

    var v = document.getElementById(getFullId(id));
    if (v === null) {
      var item = document.createElement("div");
      item.className = "item";
      v = document.createElement('video');
      v.setAttribute('id', getFullId(id));
      v.setAttribute('class', 'video-item');
      v.muted = id == 'own';
      item.appendChild(v);
      container.appendChild(item);
      clients++;
    }
    return v;
  }

  function handlePeer(peer) {
    peer.on('connect', function () {
      console.log('connect');
      findOrCreateVideo(peer._id);
    });
    peer.on('data', function (data) {
      console.log(data);
    });
    peer.on('stream', function (stream) {
      console.log('stream');
      var v = findOrCreateVideo(peer._id);
      v.srcObject = stream;
      v.play();
    });
    peer.on('error', function (error) {
      console.error(error);
    });
    peer.on('close', function () {
      console.log('close');
      var v = document.getElementById(getFullId(peer._id));
      if (v !== null) {
        container.removeChild(v.parentElement);
        clients--;
      }
    });
  }

  function initRTC(stream) {
    var video = findOrCreateVideo('own');
    if (stream) {
      video.srcObject = stream;
      video.play()
    }

    var roomId = discoveryClient.getParameterByName('id') || 'conf-default';

    let iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
    ]
    cm = new discoveryClient.Mesh(handlePeer, iceServers);
    cm.connect('/', roomId, stream);
  }
}

document.addEventListener("DOMContentLoaded", init);
