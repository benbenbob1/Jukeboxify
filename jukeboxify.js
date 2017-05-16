//(c) Ben Brown 2017 - benbrown.science
'use strict';

var Song = require('./song.js');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: "0e0d4488103548e1822aecad29d9fa57",
    clientSecret: "7b726379156543da95b9e051d1ed837a",
    redirectUri: "https://rpi2.student.rit.edu/spotify"
});
var theTrack = null;
var votePool = [];


module.exports = {
    searchTrack: searchTrack,
    indexInVotePool: indexInVotePool,
    addSongToVotePool: addSongToVotePool,
    printTopSongsByVotes: printTopSongsByVotes,
    voteByIndex: voteByIndex,
    removeSongByIndex: removeSongByIndex,
    voteBySongId: voteBySongId,
    getSongFromSpotifyId: getSongFromSpotifyId,
    addSongToPoolById: addSongToPoolById,
    sortVotePoolByVotes: sortVotePoolByVotes,
    getTopVotes: getTopVotes
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