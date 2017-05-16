//(c) Ben Brown 2017 - benbrown.science
'use strict';
var standalone = require('./standalone.js');
var webserver = require('./webserver.js');

//run as web API or standalone
//node app.js web [PORT] <- API on port 8080 else given value
// or
//node app.js <- standalone console application

var params = process.argv;
var webMode = false;
var webPort = 8080;

if (params.length > 2) {
    if (params[2] === 'web') {
        webMode = true;
        if (params.length > 3) {
            var input = parseInt(params[3]);
            if (!isNaN(input)) {
                webPort = input;
            }
        }
    }
}

if (webMode) {
    webserver.start(webPort)
} else { //start standalone mode
    standalone.start();
}