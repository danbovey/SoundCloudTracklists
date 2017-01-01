const request = require('superagent');
const jsdom = require('jsdom-no-contextify');

const parseTracklist = require('./tracklist');

const search = (query) => {
    query = query.trim();
    return request.get('http://www.1001tracklists.com/ajax/search_tracklist.php?p=' + encodeURIComponent(query) + '&noIDFieldCheck=true&fixedMode=true&sf=p')
        .then(res => {
            return new Promise((resolve) => {
                jsdom.env({
                    html: res.text,
                    loaded: (err, window) => {
                        const first = window.document.querySelector('ul li:first-child');
                        if(first != null) {
                            resolve(parseTracklist(first.id));
                        } else {
                            throw new Error('No tracklist found');
                        }
                    }
                });
            });
        });
};

module.exports = search;
