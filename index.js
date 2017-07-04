let io = require('socket.io-client');
let SimplePeer = require('simple-peer');
let Pinger = require('./src/Pinger');
let ConnectionManager = require('./src/ConnectionManager');

// https://stackoverflow.com/a/901144/642778
// https://caniuse.com/#search=URLSearchParams
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

module.exports = {
  io: io,
  SimplePeer: SimplePeer,
  ConnectionManager: ConnectionManager,
  Pinger: Pinger,
  getParameterByName: getParameterByName
}
