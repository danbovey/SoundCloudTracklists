const heroTrack = require('./heroTrack');

const timer = (tracklist) => {
    const tracks = tracklist.tracks;
    console.log(tracks);

    // Create the initial view
    heroTrack.create(tracklist);

    // List out the track cue times for faster comparison
    const trackCues = [];
    for(let t in tracks) {
        trackCues.push(parseInt(tracks[t].cueSeconds, 10));
    }
    console.log(trackCues);

    const checkTime = () => {
        const timePassed = document.querySelector('.playbackTimeline__timePassed span:last-child');
        if(timePassed != null) {
            // Convert the current track timestamp into seconds
            let currentTime = timePassed.textContent.split(':');
            const times = [
                1, // Seconds
                60, // Minutes
                3600, // Hours
            ];
            let seconds = 0;
            let t = -1;
            for(let i = currentTime.length - 1; i >= 0; i--) {
                t++;
                if(typeof times[t] != 'undefined') {
                    seconds += parseInt(currentTime[i], 10) * times[t];
                }
            }

            for(let t = 0; t < tracks.length; t++) {
                if(!trackCues.hasOwnProperty(t)) {
                    continue;
                }
                // Find the track that's currently playing and update view
                if(seconds >= trackCues[t] && (typeof trackCues[t + 1] == 'undefined' || seconds < trackCues[t + 1])) {
                    if(heroTrack.current() == null || t != heroTrack.current()) {
                        heroTrack.update(t, tracks[t]);
                    }
                }
            }
        }
    };

    let checkPlayingTask = null;
    let checkTimeTask = null;
    // Check if SoundCloud has the player controls open
    const checkPlaying = () => {
        if(checkTimeTask != null && checkPlayingTask != null) {
            window.clearInterval(checkPlayingTask);
            return;
        }
        const player = document.querySelector('.playControls.m-visible');
        if(player != null) {
            // We now have a player, so lets listen for changes to the current track time
            window.clearInterval(checkPlayingTask);
            checkTimeTask = window.setInterval(checkTime, 1000);
        }
    };
    checkPlaying();
    checkPlayingTask = window.setInterval(checkPlaying, 5000);
};

module.exports = timer;
