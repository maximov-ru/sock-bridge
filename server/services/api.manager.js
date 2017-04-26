'use strict';

var socketIo;
var instance;

/**
 * Class for sending data to client by socket
 */
class ApiManager {
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  static setIo(io) {
    socketIo = io;
  }

  static sendToSockets(sockets, messageStr, data) {
    for(var i = 0; i < sockets.length; i++){
      sockets[i].emit(messageStr, data);
    }
  }
}
module.exports = ApiManager;
