var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
};

var messages = [];

var requestMethods = {

  'GET': function(request, response){
    sendResponse(response, {results: messages});
  },
  'POST': function(request, response){
    collectData(request, function(message) {
      messages.push(message);
      sendResponse(response, message, 201);
    });
  },
  'OPTIONS': function(request, response){
    sendResponse(response, null);
  },
};

var collectData = function(request, callback){
  var data = '';
  request.on('data', function(chunk) {
    data += chunk.toString();
  });
  request.on('end', function() {
    callback(JSON.parse(data));
  });
};

var sendResponse = function(response, data, statusCode){
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

module.exports = function(request, response) {
  
  var requestMethod = requestMethods[request.method];

  if (requestMethod) {
    requestMethod(request, response);
  }
  
};
