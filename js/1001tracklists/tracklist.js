const request = require('superagent');
const jsdom = require('jsdom-no-contextify');

const parseMedia = require('./media');

const tracklist = (id) => {
    const url = 'http://www.1001tracklists.com/tracklist/' + id;
    return request.get(url)
        .then(res => {
            let title = '';
            
            return new Promise((resolve) => {
                    jsdom.env({
                        html: res.text,
                        loaded: (err, window) => {
                            // Add tracklist tracks
                            const trackItems = window.document.querySelectorAll('#middleTbl table .tlpItem');
                            const trackItemArr = [];
                            [].forEach.call(trackItems, (item) => trackItemArr.push(item));

                            // Add tracklist title
                            title = window.document.querySelector('#pageTitle').textContent;

                            resolve(Promise.all(trackItemArr.map(el => parse(el))));
                        }
                    });
                })
                .then(tracks => {
                    return {
                        id,
                        title,
                        url,
                        tracks
                    };
                });
        });
};

const parse = (trackItem) => {
    const track = {
        links: {}
    };

    const cue = trackItem.querySelector('.cueValueField');
    if(cue != null) {
        const cueTime = cue.textContent.split(':');
        // Remove leading zeros from timestamps
        for(var c in cueTime) {
            cueTime[c] = parseInt(cueTime[c], 10);
        }
        track['cue'] = cueTime.join(':');

        // Fix the timestamps of tracks that cue in on an exact minute
        if(track['cue'].indexOf(':') == -1) {
            track['cue'] += ':00';
        }
    }
    const cueSeconds = trackItem.querySelector('input[id*="tlp_cue_seconds"]');
    if(cueSeconds != null) {
        track['cueSeconds'] = cueSeconds.value;
    }

    const meta = trackItem.querySelectorAll('div[itemtype="http://schema.org/MusicRecording"] > meta');
    [].forEach.call(meta, item => {
        track[item.attributes.itemprop.value] = item.content;
    });

    const user = trackItem.querySelector('.tlUserInfo .blueTxt');
    if(user != null) {
        [].forEach.call(user.childNodes, c => {
            if(c.nodeType == Node.TEXT_NODE) {
                track['user'] = c.textContent;
            }
        });
    }

    const links = trackItem.querySelectorAll('.tlIconBox[title="open media players"] .actionIcon');
    if(links != null) {
        return parseMedia(links)
            .then(links => {
                track.links = links;

                // Return the full track to the response
                return track;
            });
    } else {
        return new Promise(resolve => resolve(track));
    }
};

module.exports = tracklist;
