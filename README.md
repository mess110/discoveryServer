# discoveryServer

Peer discovery server to help facilitate WebRTC.

```
npm install
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
npm start
```

## TODO

* add support for using a different ID than the socket.id
* return number of participants in a room
* peer to peer discovery
