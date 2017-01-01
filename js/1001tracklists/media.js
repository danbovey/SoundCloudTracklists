const request = require('superagent');
const querystring = require('querystring');
const jsdom = require('jsdom-no-contextify');

const media = (links) => {
    const sourceIds = {
        '1': 'beatport',
        '10': 'soundcloud',
        '13': 'youtube',
        '36': 'spotify'
    };
    const apis = {
        beatport: (id) => {
            // return new Promise(resolve => resolve('http://embed.beatport.com/player/?id=' + id + '&type=track'))
            return request.get('http://embed.beatport.com/player/?id=' + id + '&type=track')
                .then(res => {
                    return new Promise((resolve, reject) => {
                        jsdom.env({
                            html: res.text,
                            loaded: (err, window) => {
                                const link = window.document.querySelector('#input-share-link');
                                if(link != null) {
                                    resolve(link.value);
                                }
                                reject();
                            }
                        });
                    });
                });
        },
        soundcloud: (id) => {
            return request.get('http://api.soundcloud.com/tracks/' + id + '?client_id=caf73ef1e709f839664ab82bef40fa96')
                .then(res => res.body.permalink_url);
        },
        youtube: (id) => new Promise(resolve => resolve('https://www.youtube.com/watch?v=' + id)),
        spotify: (id) => new Promise(resolve => resolve('https://open.spotify.com/track/' + id))
    };

    const mediaList = {};
    const linksArr = [];
    [].forEach.call(links, item => linksArr.push(item));
    return Promise.all(linksArr.map(link => {
            // Parse the Media Data for the link
            const mediaData = link.getAttribute('onclick');
            let params = /({[^}]+})/i.exec(mediaData);
            params = JSON.parse(params[1].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ').replace(/'/g, '"'));

            return request.get('http://www.1001tracklists.com/ajax/get_medialink.php?' + querystring.encode(params))
                .then(res => {
                    if(!res.err) {
                        const serviceName = sourceIds[res.body.source];
                        if(typeof serviceName != 'undefined') {
                            const mediaLink = {
                                name: serviceName,
                                playerId: res.body.playerId,
                                url: ''
                            };

                            // Run the API if the service exists
                            if(typeof apis[serviceName] != 'undefined') {
                                return apis[serviceName](res.body.playerId)
                                    .then(url => {
                                        mediaLink.url = url;
                                        return mediaLink;
                                    })
                                    .catch(err => mediaLink);
                            } else {
                                return mediaLink;
                            }
                        }
                    }
                });
        }))
};

module.exports = media;
