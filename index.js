var http = require('http');
var morgan = require('morgan');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');

var serve = serveStatic('./public');
var logger = morgan('dev');

var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  logger(req, res, function() {
    serve(req, res, done);
  });
});

var port = process.env.PORT || 9292;
server.listen(port, function() {
  console.log('Listening on port %d', port);
});
