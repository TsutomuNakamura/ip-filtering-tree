# ipdict
ipdict is high performance on-memory database with key of ip address written in JavaScript.
And ipdict can search data various types flexibly.

## Getting Started
### Installing
Installing ipdict is very simple.
You just exec command like below.

```
# npm install ipdict
```

### Using
How to use ipdict fundamentally is only to use push, find and delete method after import ipdet modules.
Examples how to use are like below.

* Instantiate
```javascript
var IPDict = require('ipdict').IPDict;
var db = new IPDict();
```

* push
```javascript
db.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
// push(<ipaddr>, <subnet mask length>, <data>);
```

* find
```javascript
var result = db.find("192.168.1.0", 24);
console.log(result);  // -> Data of 192.168.1.0/24
```

* delete
```javascript
var deleted = db.delete("192.168.1.0", 24);
console.log(deleted);  // -> Data of 192.168.1.0/24
db.find("192.168.1.0", 24);  // -> undefined
```

* push file names as string
## Use examples
ipdict can push various data such as string, boolean, number or function indexed by IP address.
Specific usage examples in the program are as follows.

* push file names and open appropriate files for each source ip address.
```javascript
var IPDict = require("../index.js").IPDict;
var http = require('http');
var fs = require('fs');

var db = new IPDict();
db.push("0.0.0.0", 0, "./html/accept.html");
db.push("192.168.1.0", 24, "./html/deny.html");
db.push("127.0.0.0", 8, "./html/monitor.html");

http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    // This instruction assumes always returns correct IPv4 address.
    var srcip = request.connection.remoteAddress;

    response.end(fs.readFileSync(db.find(srcip)));
}).listen(8080);

console.log("Listing on port " + 8080);
```

* push functions and call them
```javascript
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
```

## Algorithms 00

### - 00-00 -----------------------------------------------------------------------------------------------
![algorithms00_00](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_00_00.png)

### - 00-01 -----------------------------------------------------------------------------------------------
![algorithms00_01](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_00_01.png)

### - 00-02 -----------------------------------------------------------------------------------------------
![algorithms00_02](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_00_02.png)

### - 00-03 -----------------------------------------------------------------------------------------------
![algorithms00_03](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_00_03.png)

## Algorithms 01

### - 01-00 -----------------------------------------------------------------------------------------------
![algorithms01_00](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_01_00.png)

### - 01-01 -----------------------------------------------------------------------------------------------
![algorithms01_01](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_01_01.png)

### - 01-02 -----------------------------------------------------------------------------------------------
![algorithms01_02](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_01_02.png)

### - 01-03 -----------------------------------------------------------------------------------------------
![algorithms01_03](https://github.com/TsutomuNakamura/ipdict/wiki/img/00_readme/basic_algo_01_03.png)
