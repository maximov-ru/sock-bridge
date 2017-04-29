var sockjs_url = '/echo';
var sockjs = new SockJS(sockjs_url);
(function (sockjs) {
    //extending sockjs
    //add method on
    sockjs.eventlist = {};
    sockjs.on = function (eventName, callback) {
        var cb = callback.bind(sockjs);
        sockjs.eventlist[eventName] = function (data) {
            console.log('emitted event ', eventName, data);
            cb(data);
        };
    };
    sockjs.onmessage = function (e) {
        console.log('event onmessage', e);
        var cmd = null;
        try {
            cmd = JSON.parse(e.data);
        } catch (e) {
            console.error('unrecognize command from sock-bridge');
        }
        if (cmd && cmd.command && (typeof cmd.command === 'string')) {
            if (typeof sockjs.eventlist[cmd.command] === 'function') {
                sockjs.eventlist[cmd.command](cmd.data);
            }
        }
        return e;
    };
    //call on('connected') when connection opened
    sockjs.onopen = function () {
        if (typeof sockjs.eventlist['connected'] === 'function') {
            sockjs.eventlist['connected']();
        }
    };
    //call on('disconnected') when connection closed
    sockjs.onclose = function () {
        if (typeof sockjs.eventlist['disconnect'] === 'function') {
            sockjs.eventlist['disconnect']();
        }
    };
    //add emit method for communicate with sockjs-bridge
    sockjs.emitCommand = function (command, data) {
        var cmd = JSON.stringify({
            command: command,
            data: data
        });
        sockjs.send(cmd);
    }
})(sockjs);

$('#first input').focus();
var div = $('#first div');
var inp = $('#first input');
var form = $('#first form');
var print = function (m, p) {
    p = (p === undefined) ? '' : JSON.stringify(p);
    div.append($("<code>").text(m + ' ' + p));
    div.append($("<br>"));
    div.scrollTop(div.scrollTop() + 10000);
};

sockjs.on('connected', function () {
    print('[*] open', sockjs.protocol);
    console.log('dbg', sockjs, this);
    sockjs.emitCommand('setSessionId', Math.round(Math.random() * 10000));
});
sockjs.on('message', function (data) {
    console.log('i get message ', data);
    print('[.] message', data);
});
sockjs.on('disconnect', function () {
    print('[*] close');
});

form.submit(function () {
    print('[ ] sending', inp.val());
    sockjs.send(inp.val());
    inp.val('');
    return false;
});