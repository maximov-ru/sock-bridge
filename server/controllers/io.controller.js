/**
 * Created by omaximov on 16/06/16.
 *
 * This controller manage socket.io events.
 */
'use strict';

var Player = require('../models/player');
var ApiManager = require('../services/api.manager');
var async = require('async');


var events = {

  requestStartGame: function (socket) {
    console.log('start game');
    Player.startTimer(socket.gameKey);
  },

  setKey: function (socket, data) {
    socket.gameKey = data.gameKey;
    if(!socket.gameKey){
      socket.gameKey = 'default';
    }
    Player.addPlayer(socket, socket.gameKey);
  },

  /**
   * Event will be handled if socket connection is closed
   * @param socket
     */
  disconnect: function (socket) {
    if(socket.gameKey) {
      Player.deletePlayer(socket, socket.gameKey);
    }
  }
};

/**
 * Class of socket.io controller
 */
class IoController {
  constructor(io) {
    this.io = io;
    io.on(
      'connection',
      socket => {
        console.log('connected ');
        this.connected(socket);
      }
    );
    ApiManager.setIo(io);
  }

  /**
   * subscribe to events that need handle
   * @param socket
     */
  connected(socket) {
    for (let eventName in events) {
      socket.on(eventName, (function (eventName) {
        return function (userdata) {
          events[eventName](socket, userdata);
        };
      })(eventName));
    }
  }
}

module.exports = IoController;
