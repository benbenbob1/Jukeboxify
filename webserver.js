//(c) Ben Brown 2017 - benbrown.science
'use strict';
var express           = require('express'),
    app               = express(),
    http              = require('http'),
    jukeboxify        = require('jukeboxify');

app.use(bodyParser.json());
app.post('/slack', function(req, res) {
    console.log(req);
});

function startServer() {
    http.createServer(app).listen(port);
}

startServer();