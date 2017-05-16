//(c) Ben Brown 2017 - benbrown.science
//starts a jukeboxify server (on port 8080 by default)
'use strict';
var express           = require('express'),
    app               = express(),
    http              = require('http'),
    bodyParser        = require('body-parser'),
    os                = require('os'),
    jukeboxify        = require('./jukeboxify.js');

app.use(bodyParser.urlencoded({extended: true}));
app.post('/slack', function(req, res) {
    var command = null;
    var data = req.body;
    console.log(data);
    var text = data["text"];
    var command = data["command"];
    var response = "None";
    var shouldRespond = false;
    if (command === "/jukeboxify" && text.length) {
        var input = text.split(' ');
        var myCommand = input[0];
        if (myCommand) {
            var restOfCommand = "";
            var idx = myCommand.length+1;
            if (text.length > idx) {
                restOfCommand = text.substring(idx)
            }
            if (myCommand === "search") {
                console.log("Searching for "+restOfCommand);
                shouldRespond = true;
                jukeboxify.searchTrack(restOfCommand, function(song) {
                    var response = {}
                    response[song.previewURL] =  {
                        "pretext": "Top result for '"+restOfCommand+"'",
                        "fallback": song.name + " by " + song.artist,
                        "title": song.name,
                        "author_name": song.artist,
                        "thumb_url": song.albumArtURL,
                        "text": song.albumTitle,
                        "title_link": song.previewURL
                    }
                    res.status(200).send(response);
                });
            } else if (myCommand === "preview") {
                console.log("Searching for preview of "+restOfCommand);
                shouldRespond = true;
                jukeboxify.searchTrack(restOfCommand, function(song) {
                    res.status(200).send(song.previewURL);
                });
            }
        }
    }

    if (!shouldRespond) {
        res.sendStatus(400);
    }
});

function printIPs(port) {
    var ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            console.log(ifname, iface.address+(":"+port||""));
            ++alias;
        });
    });
}

function startServer(port=8080) {
    var server = http.Server(app);
    server.listen(port, function() {
        console.log("Jukeboxify server is listening on port "+port);
        printIPs(port);
    });
}

if (typeof module !== "undefined") {
    module.exports = { 
        start: startServer //start(PORT)
    };
} else {
    startServer();
}