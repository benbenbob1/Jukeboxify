function Song(id="0", name="Unknown", artist="Unknown") {
    this.id = id;
    this.vote = 1;
    this.name = name;
    this.artist = artist;
    this.previewURL = "";
    this.albumArtURL = "";
    this.albumTitle = "";
}
Song.prototype.voteUp = function() {
    this.vote ++;
}
Song.prototype.voteDown = function() {
    /*
    //Uncomment for scaled voting
    if (this.vote < 0) {
        this.vote = (this.vote - Math.abs(this.vote)/6.0).toFixed(2);
    } else {
        this.vote --;
    }*/
    this.vote --;
}
Song.prototype.toString = function() {
    var plus = this.vote>0?"+":""
    return "<"+plus+this.vote+"> "+this.artist+" - "+this.name+" ("+this.id+")"
}

if (typeof module !== "undefined") {
    module.exports = Song;
}
