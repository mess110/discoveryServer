let io = require('socket.io-client');
let SimplePeer = require('simple-peer');
let Pinger = require('./src/Pinger');
let Mesh = require('./src/Mesh');

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

// Parse data and format it nicely as json
function parse(socket, peer, data) {
    let string = data instanceof Uint8Array ? new TextDecoder("utf-8").decode(data) : data
    let json = JSON.parse(string)
    let from = peer.cmKey.split(Mesh.CM_KEY_SPLIT_CHAR)
    from.remove(socket.id)
    json.from = from.first()
    json.cmKey = peer.cmKey
    return json
}

module.exports = {
    io: io,
    SimplePeer: SimplePeer,
    Mesh: Mesh,
    Pinger: Pinger,
    getParameterByName: getParameterByName,
    parse: parse
}
