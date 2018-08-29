var _ = require('lodash');

var instanceSessionManager;
var sessionsMap = {};
var socketsMap = {};

class SessionManager{
    constructor() {
        if (!instanceSessionManager) {
            instanceSessionManager = this;
        }

        return instanceSessionManager;
    }

    static sessionConnectedEmit(socket) {

    }

    static socketConnectedEmit(socket) {

    }

    static sessionDisconnectedEmit(socket) {

    }

    static socketDisconnectedEmit(socket) {

    }

    static commandFromUserEmit(socket, cmd) {

    }

    static socketConnected(socket) {
        var sessionId = socket.sessionId;
        var socketId = socket.id;
        socketsMap[socketId] = socket;

        if (!sessionsMap[sessionId]) {
            sessionsMap[sessionId] = {
                connectedCount: 0,
                socketsMap: {}
            };
            SessionManager.sessionConnectedEmit(socket);
        }

        sessionsMap[sessionId].connectedCount++;
        sessionsMap[sessionId].socketsMap[socketId] = socket;
        SessionManager.socketConnectedEmit(socket);
    }

    static socketDisconnected(socket) {
        var sessionId = socket.sessionId;
        var socketId = socket.id;

        if (!sessionsMap[sessionId]) {
            console.log('strange bus session '+sessionId+' not found in map');
            sessionsMap[sessionId] = {
                connectedCount: 1,
                socketsMap: {}
            };
        }
        sessionsMap[sessionId].connectedCount--;

        delete socketsMap[socketId];
        delete sessionsMap[sessionId].socketsMap[socketId];
        if (sessionsMap[sessionId].connectedCount <= 0) {
            SessionManager.sessionDisconnectedEmit(socket);
        }
        SessionManager.socketDisconnectedEmit(socket);
    }

    static emitForSessionId(sessionId, command, data, exclude){
        if (sessionsMap[sessionId]) {
            var excludeSocketsIds = exclude ? _.keyBy(exclude.socketsIds, o => o) : {};
            for (var socketId in sessionsMap[sessionId].socketsMap) {
                if (!excludeSocketsIds[socketId]) {
                    SessionManager.emitForSocketId(socketId, command, data);
                }
            }
        }
    }

    static emitForSocketId(socketId, command, data){
        if (socketsMap[socketId]) {
            socketsMap[socketId].emitCommand(command, data);
        }
    }

    static emitForAll(command, data, exclude){
        var excludeSocketsIds = exclude ? _.keyBy(exclude.socketsIds, o => o) : {};
        var excludeSessionsIds = exclude ? _.keyBy(exclude.sessionsIds, o => o) : {};
        for (var sessionId in sessionsMap) {
            if (!excludeSessionsIds[sessionId]) {
                for (var socketId in sessionsMap[sessionId].socketsMap) {
                    if (!excludeSocketsIds[socketId]) {
                        SessionManager.emitForSocketId(socketId, command, data);
                    }
                }
            }
        }
    }
}

module.exports = SessionManager;