var http = require('http');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');

var serve = serveStatic('./public');

var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

var port = process.env.PORT || 9292;
server.listen(port, function() {
  console.log('Listening on port %d', port);
});
