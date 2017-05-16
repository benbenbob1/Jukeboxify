//(c) Ben Brown 2017 - benbrown.science
'use strict';

var jb = require('./jukeboxify.js');
const readline = require('readline');

if (typeof module !== "undefined") {
    module.exports = { 
        start: startStandalone
    };
} else {
    startStandalone();
}

function startStandalone() {
    console.log("Starting jukeboxify in standalone mode");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    ask(rl);
}

function ask(readline) {
    readline.question("Search for a track\n> ", function(answer) {
        jb.searchTrack(answer, function(song) {
            if (song) {
                var nextSteps = function(song) {
                    console.log("Track found: "+song.name+" by "+song.artist)
                    var votePos = jb.indexInVotePool(song.id);
                    var inPool = false;
                    var options = {
                        "add": {
                            command: "add",
                            desc: "add to vote pool",
                            does: function(song) {
                                jb.addSongToVotePool(song);
                                console.log(jb.printTopSongsByVotes());
                            }
                        },
                        "info": {
                            command: "info",
                            desc: "print song info",
                            does: function(song) {
                                console.log(song);
                            }
                        },
                        "preview": {
                            command: "preview",
                            desc: "get 30 second preview",
                            does: function(song) {
                                console.log(song.previewURL);
                            }
                        },
                        "search": {
                            command: "search",
                            desc: "search for another song",
                            does: function(song) {
                                ask(readline);
                            }
                        },
                        "up": {
                            command: "up",
                            desc: "vote song up",
                            does: function(song) {
                                jb.voteBySongId(song.id, 1);
                                console.log(jb.printTopSongsByVotes());
                            }
                        },
                        "down": {
                            command: "down",
                            desc: "vote song down",
                            does: function(song) {
                                jb.voteByIndex(votePos, -1);
                                console.log(jb.printTopSongsByVotes());
                            }
                        }
                    }
                    var available = [options.info, options.preview, options.search];
                    if (votePos != -1) {
                        console.log("It is currently #"+(votePos+1)+" in the pool.")
                        inPool = true;
                        available.push(options.up);
                        available.push(options.down);
                    } else {
                        available.push(options.add);
                    }
                    var question = "What would you like to do?\n";
                    var option = null;
                    for (var item in available) {
                        option = available[item];
                        question += "\t"+option.command+": "+option.desc+"\n"
                    }
                    readline.question(question+"> ", function(answer) {
                        var trimmed = answer.trim().toLowerCase();
                        var realOpt = null;
                        for (var opt in available) {
                            if (available[opt].command === trimmed) {
                                realOpt = available[opt];
                                break;
                            }
                        }
                        if (realOpt) {
                            realOpt.does(song);
                            nextSteps(song);
                        } else {
                            console.log("'"+ trimmed + "' is not an available option.");
                            ask(readline);
                        }
                    });
                    return "";
                };
                nextSteps(song);
            }
        });
    });
}


/*
var SB = require('slackbots');
var SLACK_CHANNEL = "music-test";

var slackBot = new SB({
    token: "xoxb-140670664470-xV5eCHatBfvHNLnSnP1MXqn7",
    name: 'Jukeboxify'
});

slackBot.on('start', function() {
    slackBot.postMessageToChannel(SLACK_CHANNEL, "TEST");
    slackBot.postMessageToUser("ben", "TEST2");
})

slackBot.on("message", function(input) {
    console.log("Rec Message", input);
    if (input.type == "message" && input.text) {
        var text = input.text;
        var re = /<@.*>(.*)/;
        var matches = text.match(re);
        if (matches && matches.length > 1) {
            var content = matches[1].trim();
            var params = content.split(" ");
            if (params.length > 0) {
                var parse = parseCommand(params[0]);
                if (!parseCommand) {

                }
            } else {

            }
        }
    }
});

function parseCommand(firstWord) {
    return false
}

function musicCommand(params) {
    console.log("Rec params", params);
}
*/

/*
for (var i=0; i<15; i++) {
    addSongToVotePool(new Song("00"+(i+1), "SongName"+(i+1), "SongArtist"+(i+1)));
}


console.log(printTopSongsByVotes());
console.log("Voting 02 up by 2");
voteBySongId("02", 1)
voteBySongId("02", 1)
console.log(printTopSongsByVotes());
console.log("Voting top song up by 2");
voteByIndex(0, 1);
voteByIndex(0, 1);
console.log(printTopSongsByVotes());
console.log("Adding new song, voting up by 2");
voteBySongId("043289", 1)
voteBySongId("043289", 1)
console.log(printTopSongsByVotes());
console.log("Removing top song, voting up top 1");
removeSongByIndex(0);
voteByIndex(0);
console.log(printTopSongsByVotes());*/