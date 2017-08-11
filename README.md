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

## algorithms
ipdict use the algorithm tree diagram for reduce search time for data that user has pushed.
Images for searching data by using key is like below.









