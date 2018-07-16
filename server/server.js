var log = console.log;
var error = Error;


var mainConfig = require('./main.config');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

//import port number from configuration file
var port = mainConfig.webServer.port;
//import http protocol library
var http = require('http');
var sockjs  = require('sockjs');
//import and run express js framework
var app = require('express')();
//create http server with express js
var server = http.createServer(app);
//import and set socket.io library to our http server
//var io = require('socket.io')(server);

var sockjs_opts = {sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};

var sockjs_echo = sockjs.createServer(sockjs_opts);
sockjs_echo.installHandlers(server, {prefix:'/echo'});

//run http server listing on port from config
server.listen(port, mainConfig.webServer.ip,
  function (err) {
    if (err) {
      error(err);
    } else {
      log('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
    }
  });

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
//import socket.io controller
var IoController = require('./controllers/io.controller');
//run socket io controller
new IoController(sockjs_echo);

var getIndexContent = function () {
  var indexFile = path.resolve('server/dist/index.html');
  return fs.readFileSync(indexFile, 'utf8');
};

app.get('/images/*', function (req, res) {
  res.sendFile(path.resolve('client/images/' + req.params[0]));
});

app.post('/api/send_msg/', function (req, res) {
  if (req && req.body && req.body.user_id) {
    log(JSON.stringify(req.body));
    var exclude = req.body.exclude || [];
    IoController.emitForSessionId(req.body.user_id,req.body.command,JSON.stringify(req.body.data), exclude);
      res.send('ok');
  }else{
      res.send('bsd format');
  }
    log(JSON.stringify(Object.keys(req)));
    log(JSON.stringify(req.body));

    //res.sendFile(path.resolve('client/images/' + req.params[0]));
});

if (mainConfig.webServer.isProdMode) {
  //set route for assets
  app.get('/virtual/*', function (req, res) {
    res.sendFile(path.resolve('server/dist/' + req.params[0]));
  });
  //set route for web site base path
  app.get('/', function (req, res) {
    res.sendFile(path.resolve('server/dist/index.html'));
  });
} else {
  //import and set webpack
  var webpack = require('webpack');
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var wpConfig = require('./webpack.config');
  var compiler = webpack(wpConfig);
  app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: wpConfig.output.publicPath}));
  app.use(webpackHotMiddleware(compiler));
  //set route for web site base path
  app.get('/', function (req, res) {
    var filename = path.join(compiler.outputPath, 'index.html');
    var content = compiler.outputFileSystem.readFileSync(filename);
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Length', content.length);
    res.send(content);
  });
  getIndexContent = function () {
    var filename = path.join(compiler.outputPath, 'index.html');
    return compiler.outputFileSystem.readFileSync(filename);
  };
}
