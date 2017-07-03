module.exports = class Nurse {
  constructor () {
    this.rooms = {}
  }

  getSockets (roomId) {
    this.defaultRoom(roomId);
    return this.rooms[roomId];
  }

  addSocket (socket, roomId) {
    this.defaultRoom(roomId);
    this.rooms[roomId].push(socket)
  }

  removeSocket (socket) {
    var result = {
      id: socket.id,
      rooms: []
    };
    for (let roomKey in this.rooms) {
      for (let s of this.getSockets(roomKey)) {
        if (socket.id === s.id) {
          result.rooms.push(roomKey);
        }
      }
    }

    for (let roomKey of result.rooms) {
      this.rooms[roomKey] = this.rooms[roomKey].filter(function (e) { return e.id !== result.id })
    }

    return result;
  }

  defaultRoom (roomId) {
    if (this.rooms[roomId] === undefined) {
      this.rooms[roomId] = []
    }
  }

  toJson () {
    var result = {}
    for (let roomKey in this.rooms) {
      result[roomKey] = this.getSockets(roomKey).map(function (e) { return e.id })
    }
    return result;
  }
}
