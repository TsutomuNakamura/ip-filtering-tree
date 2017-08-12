var IPDict = require("../index.js").IPDict;
var http = require('http');
var ipaddr = require('ipaddr.js');
var fs = require('fs');

var db = new IPDict();
db.push("0.0.0.0", 0, "./html/accept.html");
db.push("192.168.1.0", 24, "./html/deny.html");
db.push("127.0.0.0", 8, "./html/monitor.html");

http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    var srcip = request.connection.remoteAddress;

    if(ipaddr.IPv6.isValid(srcip)) {
        srcip = ipaddr.IPv6.parse(srcip);
        if(srcip.isIPv4MappedAddress()) {
            srcip = srcip.toIPv4Address().toString();
        }
    }

    console.log("Src IP: " + srcip);
    response.end(fs.readFileSync(db.find(srcip)));
}).listen(8080);

console.log("Listing on port " + 8080);


