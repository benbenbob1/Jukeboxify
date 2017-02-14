//(c) Ben Brown 2017 - benbrown.science
'use strict';

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var Song = require('./song.js');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: "0e0d4488103548e1822aecad29d9fa57",
    clientSecret: "7b726379156543da95b9e051d1ed837a",
    redirectUri: "https://rpi2.student.rit.edu/spotify"
});
var theTrack = null;

ask();
function ask() {
    rl.question("Search for a track\n> ", function(answer) {
        searchTrack(answer, function(song) {
            if (song) {
                var nextSteps = function(song) {
                    console.log("Track found: "+song)
                    var votePos = indexInVotePool(song.id);
                    var inPool = false;
                    var options = {
                        "add": {
                            command: "add",
                            desc: "add to vote pool",
                            does: function(song) {
                                addSongToVotePool(song);
                                console.log(printTopSongsByVotes());
                            }
                        },
                        "info": {
                            command: "info",
                            desc: "print song info",
                            does: function(song) {
                                console.log(song);
                            }
                        },
                        "search": {
                            command: "search",
                            desc: "search for another song",
                            does: function(song) {
                                ask();
                            }
                        },
                        "up": {
                            command: "up",
                            desc: "vote song up",
                            does: function(song) {
                                voteBySongId(song.id, 1);
                                console.log(printTopSongsByVotes());
                            }
                        },
                        "down": {
                            command: "down",
                            desc: "vote song down",
                            does: function(song) {
                                voteByIndex(votePos, -1);
                                console.log(printTopSongsByVotes());
                            }
                        }
                    }
                    var available = [options.info, options.search];
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
                    rl.question(question+"> ", function(answer) {
                        var realOpt = options[answer.trim()];
                        if (realOpt) {
                            realOpt.does(song);
                            nextSteps(song);
                        } else {
                            ask();
                        }
                    })
                };
                nextSteps(song);
            }
        });
    });
}


//Callback is given a Song object
function searchTrack(query, callback) {
    spotifyApi.searchTracks(query, {
        limit: 14,
        type: 'track'
        }).then(
        function(data) {
            var body = data.body;
            var tracks = body.tracks;
            var numTracksFound = tracks.total;
            if (numTracksFound == 0) {
                console.log("No tracks found for search query.")
            } else {
                var tracksFound = tracks.items;
                //var track = tracks.items[0]
                //console.log("Track found: ", track[0])
                var curTrack;
                for (var idx in tracksFound) {
                    curTrack = tracksFound[idx];
                    if (curTrack.type == "track") {
                        theTrack = new Song(curTrack.id, curTrack.name, curTrack.artists[0].name);
                        theTrack.previewURL = curTrack.preview_url;
                        theTrack.albumArtURL = curTrack.album.images[1].url;
                        theTrack.albumTitle = curTrack.album.name;
                        /*console.log("Track found at item " + idx)
                        addSongToVotePool(theTrack);
                        console.log(printTopSongsByVotes());*/
                        callback(theTrack);
                        break;
                    }
                }
            }
            callback(false);
        },
        function(err) {
            console.error(err);
            callback(false);
        }
    );
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

var votePool = [];

function indexInVotePool(id) {
    for (var i=0; i<votePool.length; i++) {
        if (votePool[i].id === id) {
            return i;
        }
    }
    return -1;
}

function addSongToVotePool(song) {
    var songFound = false;
    for (var i=0; i<votePool.length; i++) {
        if (votePool[i].id === song.id) {
            voteByIndex(i, 1); //Vote up by 1 if already in list
            songFound = true;
            break;
        }
    }
    if (!songFound) {
        votePool.push(song);
    }
    sortVotePoolByVotes(votePool);
    return true;
}

function printTopSongsByVotes(numToShow=10) {
    var output = [];
    var top = getTopVotes(numToShow);
    var plus = ""
    for (var i=0; i<top.length; i++) {
        output.push((i+1)+": "+top[i].toString())
    }
    return output.join("\n");
}

function voteByIndex(zeroBasedIndex, voteDir=1) {
    if (zeroBasedIndex >= votePool.length || zeroBasedIndex < 0) {
        return false
    }
    var song = votePool[zeroBasedIndex];
    //console.log("Voting "+(oneBasedIndex-1)+)
    if (voteDir > 0) {
        song.voteUp();
    } else if (song.vote <= -5) { //Remove the song if it's hated
        removeSongByIndex(zeroBasedIndex);
    } else if (voteDir < 0) {
        song.voteDown();
    }
    sortVotePoolByVotes(votePool);
}

function removeSongByIndex(zeroBasedIndex) {
    votePool.splice(zeroBasedIndex, 1);
}

// 1 or -1 to vote
function voteBySongId(songId, voteDir=1) {
    var idx = indexInVotePool(songId);
    if (idx != -1) {
        return voteByIndex(idx, voteDir);
    }

    getSongFromSpotifyId(songId, function(song) {
        //
    });
    //Song not found
    return addSongToPoolById(songId);
}

//Callback contains song object or null
function getSongFromSpotifyId(songId, callback) {
    spotifyApi.getTrack(songId).then(function(data) {
        var body = data.body;
        console.log("Track from "+songId, body);
    })
}

function addSongToPoolById(songId) {

    return addSongToVotePool(new Song(songId));
}

function sortVotePoolByVotes(pool) {
    pool.sort(function(songA, songB) {
        return songB.vote - songA.vote;
    })
}

function getTopVotes(numToShow=10) {
    return votePool.slice(0, numToShow);
}

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