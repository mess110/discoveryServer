# discoveryServer

Peer discovery server to help facilitate WebRTC.

```
npm install
npm run genkey
npm start
```

## TODO

* add support for using a different ID than the socket.id
* return number of participants in a room
* peer to peer discovery

```
docker run -itd --name discovery-server --restart unless-stopped -e DS_PORT=443 -p 443:443 discovery-server
```
