const searchTracklists = require('./1001tracklists/search');

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    switch(req.endpoint) {
        case 'search':
            searchTracklists(req.query)
                .then(res => sendResponse({ res }))
                .catch(err => sendResponse({ err }));
    }

    return true;
});
