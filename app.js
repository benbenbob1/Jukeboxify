//(c) Ben Brown 2017 - benbrown.science
'use strict';
var standalone = require('./standalone.js');
var webserver = require('./webserver.js');

//run as web API or standalone
//node app.js web [PORT] <- API on port 80 else given value
// or
//node app.js <- standalone console application

var params = process.argv;
var webMode = false;

if (params.length > 2) {
    if (params[2] === 'web') {
        webMode = true;
        var port = 80;
        if (params.length > 3) {
            input = parseInt(params[3]);
            if (!isNaN(port)) {
                port = input;
            }
        }
    }
}

if (webMode) {

} else { //start standalone mode
    standalone.start();
}