var express = require('express');
var app = express();
var path = require('path');

// viewed at http://localhost:8080

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static(__dirname + '/'));
app.listen(20032);
console.log("server running on 20032");