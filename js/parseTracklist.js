const request = require('superagent');
const querystring = require('querystring');

const parseTracklist = (trackItems) => {
    const tracks = [];

    const trackItemArr = [];
    [].forEach.call(trackItems, (item) => trackItemArr.push(item));
    const parseTrack = (trackItem) => {
        const track = {
            cue: trackItem.querySelector('.cueValueField').textContent,
            cueSeconds: trackItem.querySelector('.cueValueField').nextSibling.value,
            links: {}
        };

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
            const sourceIds = {
                '1': 'beatport',
                '10': 'soundcloud',
                '13': 'youtube',
                '36': 'spotify'
            };
            const linksArr = [];
            [].forEach.call(links, item => linksArr.push(item));
            return Promise.all(linksArr.map(link => {
                    // Parse the Media Data for the link
                    const mediaData = link.getAttribute('onclick');
                    let params = /({[^}]+})/i.exec(mediaData);
                    params = JSON.parse(params[1].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ').replace(/'/g, '"'));

                    return request.get('http://www.1001tracklists.com/ajax/get_medialink.php?' + querystring.encode(params))
                        .then(res => {
                            if(!res.err && res.body) {
                                if(typeof sourceIds[res.body.source] != 'undefined') {
                                    // Run the API for sourceIds[res.body.source]

                                    track.links[sourceIds[res.body.source]] = res.body.playerId;
                                }
                            }
                        });
                }))
                .then(() => {
                    return track;
                });
        } else {
            return new Promise((resolve) => resolve(track));
        }
    };

    return Promise.all(trackItemArr.map(el => parseTrack(el)));
}

module.exports = parseTracklist;
