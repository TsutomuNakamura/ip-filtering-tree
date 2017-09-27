# ip-filtering-tree

[![NPM](https://nodei.co/npm/ip-filtering-tree.png)](https://nodei.co/npm/ip-filtering-tree/) 

[![Build Status](https://travis-ci.org/TsutomuNakamura/ip-filtering-tree.svg?branch=master)](https://travis-ci.org/TsutomuNakamura/ip-filtering-tree) 
[![npm](https://img.shields.io/npm/v/ip-filtering-tree.svg)](https://npmjs.com/package/ip-filtering-tree) 
[![GitHub license](https://img.shields.io/github/license/TsutomuNakamura/ip-filtering-tree.svg)](https://github.com/TsutomuNakamura/ip-filtering-tree) 
[![npm total downloads](https://img.shields.io/npm/dt/ip-filtering-tree.svg)](https://github.com/TsutomuNakamura/ip-filtering-tree) 

ip-filtering-tree is high performance on-memory database with key of ip address written in JavaScript.
Due to benefits of applying this algorithm, there are little lag even if a lots of record were registered in the db as long as the permit the space of memory.

It can also search data various types flexibly with Longest prefix match(also called Maximum prefix length match) rules by using tree algorithms.

## Getting Started
### Installing
Installing the module is just run the command like below.

```
# npm install ip-filtering-tree
```

### Usage
The basic usage of ip-filtering-tree is to call push, find and delete functions after import this module.
Examples are like below.

* Instantiate
```javascript
var IPFilteringTree = require('ip-filtering-tree').IPFilteringTree;
var db = new IPFilteringTree();
```

* push
```javascript
// push(<ipaddr>, <subnet mask length>, <data>);
db.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
db.push("192.168.2.0", 24, "Data of 192.168.2.0/24");
db.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
```

* find
```javascript
db.find("192.168.1.0");    // -> Data of 192.168.1.0/24
db.find("192.168.2.100");    // -> Data of 192.168.2.0/24
db.find("192.168.101.32");    // -> Data of 192.168.0.0/16
```

* delete
```javascript
db.delete("192.168.1.0", 24);    // -> Data of 192.168.1.0/24
db.find("192.168.1.0");  // -> data of 192.168.0.0/16
db.delete("192.168.0.0", 16);    // -> Data of 192.168.0.0/16
db.find("192.168.1.0");  // -> undefined (Data of 0.0.0.0/0)
```

## Use examples
ip-filtering-tree can push various data such as string, boolean, number or function indexed by IP address.
Specific usage examples in the program are as follows.

* Push file names and open appropriate files for each source ip address.
```javascript
var IPFilteringTree = require("ip-filtering-tree").IPFilteringTree;
var http = require('http');
var fs = require('fs');

var db = new IPFilteringTree();
db.push("0.0.0.0", 0, "./html/accept.html");  /* It is a default */
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

* Push functions and call them for each source ip address.
```javascript
var IPFilteringTree = require("ip-filtering-tree").IPFilteringTree;
var http = require('http');
var ipaddr = require('ipaddr.js');
var fs = require('fs');

var db = new IPFilteringTree();
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

    /* Find the appropriate function and call it with the parameter 'response' */
    db.find(srcip)(response);
}).listen(8080);

console.log("Listing on port " + 8080);
```

## Algorithms 00

It is the case to search the data reaches top of the leaf without mismatch.

### - 00-00 -----------------------------------------------------------------------
![algorithms00_00](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_00_00.png)

### - 00-01 -----------------------------------------------------------------------
![algorithms00_01](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_00_01.png)

### - 00-02 -----------------------------------------------------------------------
![algorithms00_02](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_00_02.png)

### - 00-03 -----------------------------------------------------------------------
![algorithms00_03](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_00_03.png)

## Algorithms 01
It is the case to search the data reaches middle of the leaf with mismatch.

### - 01-00 -----------------------------------------------------------------------
![algorithms01_00](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_01_00.png)

### - 01-01 -----------------------------------------------------------------------
![algorithms01_01](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_01_01.png)

### - 01-02 -----------------------------------------------------------------------
![algorithms01_02](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_01_02.png)

### - 01-03 -----------------------------------------------------------------------
![algorithms01_03](https://github.com/TsutomuNakamura/ip-filtering-tree/wiki/img/00_readme/basic_algo_01_03.png)

## TODO
* Apply IPv6 features
* Apply cache features

## License
This software is released under the MIT License, see LICENSE.txt.
