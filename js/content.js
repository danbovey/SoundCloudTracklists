const soundCloudTimer = require('./soundcloud/timer');

const checkPage = () => {
    let checkCount = 0;

    const check = () => {
        // Detect whether we are on a track page
        // TODO: Some tracks can be full image banners (which is a different class)
        if(document.querySelector('.fullListenHero') != null) {
            init();
        } else if(checkCount < 5) {
            checkCount++;
            window.setTimeout(check, 500);
        }
    };

    window.setTimeout(check, 500);
};

// Check after page load
window.setTimeout(checkPage, 500);

// Check again if URL is changed
// SoundCloud doesn't seem to use onpopstate, onhashchange
let oldHref = window.location.href;
const detectUrlChange = () => {
    if(oldHref != window.location.href) {
        oldHref = window.location.href;

        checkPage();
    }
};
window.setInterval(detectUrlChange, 1000);

let timerTrackTitle = null;
const init = () => {
    const hero = document.querySelector('.fullListenHero');
    const title = hero.querySelector('.soundTitle__title').textContent;

    // Stop the extension injecting twice
    if(timerTrackTitle == title) {
        return;
    }
    timerTrackTitle = title;

    console.log('SoundCloudTracklists v' + chrome.runtime.getManifest().version);
    chrome.runtime.sendMessage({ endpoint: 'search', query: title }, resp => {
        if(!resp.err) {
            console.log('Found Tracklist ' + resp.res.id);

            // Run the SoundCloud injection
            soundCloudTimer(resp.res);
        } else {
            console.log('No tracklist found');
        }
    });
};
