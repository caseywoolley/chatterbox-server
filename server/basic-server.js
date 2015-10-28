/* Import node's http module: */
var http = require("http");
var url = require('url');

var handleRequest = require("./request-handler");

var port = 3000;
var ip = "127.0.0.1";


var server = http.createServer(function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  handleRequest(request, response);
});
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);