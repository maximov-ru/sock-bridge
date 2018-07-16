'use strict';

var SessionManager = require('../services/session.manager');

var events = {

    setSessionId: function (socket, sessionId) {
        console.log('getting sessionId', sessionId);
        //socket.emitCommand('message','Hello new user with id '+sessionId);
        socket.sessionId = sessionId;
        SessionManager.socketConnected(socket);
    },

    connected: function (socket) {
        console.log('connected event');
    },

    /**
     * Event will be handled if socket connection is closed
     * @param socket
     */
    disconnect: function (socket) {
        SessionManager.socketDisconnected(socket);
    }
};

/**
 * Class of socket.io controller
 */
class IoController {
    constructor(sockjs_echo) {
        this.io = sockjs_echo;
        this.io.on(
            'connection',
            socket => {
                //console.log('connected ', socket);
                this.connected(socket);
            }
        );
        //ApiManager.setIo(this.io);
    }

    /**
     * subscribe to events that need handle
     * @param socket
     */
    connected(socket) {
        (function (sockjs) {
            sockjs.emitCommand = function (command, data) {
                var cmd = JSON.stringify({
                    command: command,
                    data: data
                });
                sockjs.write(cmd);
            }
        })(socket);
        //console.log(socket.emit.toString());
        events.connected(socket);
        socket.on('data', (data) => {
            var cmd = null;
            try {
                cmd = JSON.parse(data);
            } catch (e) {
                console.log('parsing data error');
                cmd = null;
            }

            if (cmd && cmd.command && (typeof cmd.command === 'string')) {
                if (typeof events[cmd.command] === 'function' && cmd.command !== 'disconnect') {
                    events[cmd.command](socket, cmd.data);
                } else {
                    //send command to external
                    SessionManager.commandFromUserEmit(socket, cmd);
                }
            }
        });
        socket.on('close', () => {
            events.disconnect(socket);
        })
    }

    static emitForSessionId(sessionId, command, data, exclude){
        SessionManager.emitForSessionId(sessionId, command, data, exclude);
    }
}

module.exports = IoController;
