/* global process */
var config = {
    webServer: {
        ip: '0.0.0.0',
        port: process.env.WEB_CLIENT_PORT || 3002,
        isProdMode: process.env.NODE_ENV == 'production'
    },
    execOnActions: {
        sessionConnectedEmit: '',
        socketConnectedEmit: '',
        sessionDisconnectedEmit: '',
        socketDisconnectedEmit: '',
        commandFromUserEmit: ''
    }
};
module.exports = config;
