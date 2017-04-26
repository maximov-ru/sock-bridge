/**
 * Created by omaximov on 09/01/17.
 */
'use strict'

var ApiManager = require('../services/api.manager');
var config = require('../locations.config');

var players = {};
var playersMap = {};
var timersMap = {};

class Player {
  constructor() {

  }

  static startTimer(key) {
    var downCnt = 3;
    ApiManager.sendToSockets(players[key],'gameTimer',downCnt);
    var int = setInterval(
      ()=> {
          downCnt--;
          ApiManager.sendToSockets(players[key],'gameTimer',downCnt);
          if (downCnt == 0) {
            clearInterval(int);
            Player.sendRoles(key);
          }
        }
      , 1000
    );
  }

  static sendRoles(key) {
    var gameId = "game"+Math.floor(Math.random() * 1000);
    var rnd = Math.floor(Math.random() * config.locations.length);
    var rndLocation = config.locations[rnd];
    var copyProfessions = [];
    var copyPlayers = players[key].slice();//copy array
    while(copyPlayers.length > 0){
      if(copyProfessions.length == 0){
        copyProfessions = rndLocation.professions.slice();//copy array
      }
      var rndProf = Math.floor(Math.random() * copyProfessions.length);
      var prof = copyProfessions.splice(rndProf,1);
      prof = prof[0];
      copyPlayers[0].info = {
        role: prof,
        location: rndLocation.title,
        game: gameId,
        image: rndLocation.background
      };
      copyPlayers.shift();
    }

    //select spy
    var rndPlayer = Math.floor(Math.random() * players[key].length);
    players[key][rndPlayer].info = {role: config.spyname, game: gameId, image: config.spyimage};
    for(var i = 0; i < players[key].length; i++){
      players[key][i].emit("gameRole", players[key][i].info);
    }
  }

  static sendPlayersCount(key) {
    console.log('players count', players[key].length);
    var count = players[key].length;
    for(var ind = 0; ind < count; ind++){
      var pl = players[key][ind];
      pl.emit('playersCount',count);
    }
  }

  static addPlayer(socket, key) {
    if(!Array.isArray(players[key])){
      players[key] = [];
      playersMap[key] = {};
    }
    players[key].push(socket);
    var id = socket.id;
    playersMap[key][id] = socket;
    Player.sendPlayersCount(key);
  }

  static deletePlayer(socket, key) {
    console.log('delete player');
    var id = socket.id;
    for(var ind = 0; ind < players[key].length; ind++){
      var pl = players[key][ind];
      if(pl.id == id){
        players[key].splice(ind,1);
        break;
      }
    }
    delete playersMap[key][id];
    if(players[key].length > 0){
      Player.sendPlayersCount(key);
    }else{
      console.log('players count', players[key].length);
      delete players[key];
      delete playersMap[key];
    }
  }
}
module.exports = Player;
