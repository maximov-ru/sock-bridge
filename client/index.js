var sockjs_url = '/echo';
var sockjs = new SockJS(sockjs_url);
$('#first input').focus();
var div  = $('#first div');
var inp  = $('#first input');
var form = $('#first form');
var print = function(m, p) {
    p = (p === undefined) ? '' : JSON.stringify(p);
    div.append($("<code>").text(m + ' ' + p));
    div.append($("<br>"));
    div.scrollTop(div.scrollTop()+10000);
};
sockjs.onopen    = function()  {print('[*] open', sockjs.protocol);};
sockjs.onmessage = function(e) {print('[.] message', e.data);};
sockjs.onclose   = function()  {print('[*] close');};
form.submit(function() {
    print('[ ] sending', inp.val());
    sockjs.send(inp.val());
    inp.val('');
    return false;
});