var IPDict = require("../index.js").IPDict;
var http = require('http');
var ipaddr = require('ipaddr.js');
var fs = require('fs');

var db = new IPDict();
db.push("0.0.0.0", 0, function(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end("404 Not Found\n");
});
db.push("192.168.1.0", 24, function(response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(fs.readFileSync('./html/accept.html'));
});
db.push("127.0.0.0", 8, function(response) {
    var request = http.request({
        host: 'monitor-server',
        port: 80,
        path: "/",
        method: "GET"
    });
    request.end();
    request.on('response', function(proxyResponse) {
        var data = "";
        proxyResponse.on('data', function(chunk) {
            data += chunk;
        });
        proxyResponse.on('end', function () {
            response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
            response.end(data);
        });
    });
});

http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    var srcip = request.connection.remoteAddress;

    if(ipaddr.IPv6.isValid(srcip)) {
        srcip = ipaddr.IPv6.parse(srcip);
        if(srcip.isIPv4MappedAddress()) {
            srcip = srcip.toIPv4Address().toString();
        }
    }

    db.find(srcip)(response);
}).listen(8080);

console.log("Listing on port " + 8080);


