let currentNum = null;

const heroTrack = {
    current: () => currentNum,
    playerArea: null,
    els: [],
    create: (tracklist) => {
        const heroArea = document.querySelector('.fullHero__playerArea');
        heroArea.classList.add('hasTracklist');
        // Add the transition after initial
        window.setTimeout(() => {
            heroArea.style.transition = 'transform 0.3s ease-in-out';
        }, 10);
        heroTrack.playerArea = heroArea;

        const tracklistArea = document.createElement('div');
        tracklistArea.classList.add('fullHero__tracklist');

        const addEl = (name, el, parent = tracklistArea) => {
            parent.appendChild(el);
            heroTrack.els[name] = el;
        };

        // const playingFrom = document.createElement('span');
        // playingFrom.classList.add('tracklist__playingFrom');
        // playingFrom.innerHTML = 'Playing from: <a href="' + tracklist.url + '" target="_blank">' + tracklist.title + '</a>';
        // addEl('playingFrom', playingFrom);

        const trackMeta = document.createElement('div');
        trackMeta.classList.add('tracklist__meta');
        tracklistArea.appendChild(trackMeta);

        const listNumber = document.createElement('span');
        listNumber.classList.add('tracklist__number');
        addEl('number', listNumber, trackMeta);

        const cueTime = document.createElement('span');
        cueTime.classList.add('tracklist__cueTime');
        addEl('cueTime', cueTime, trackMeta);

        const trackTitle = document.createElement('a');
        trackTitle.setAttribute('target', '_blank');
        trackTitle.setAttribute('class', 'tracklist__title g-type-shrinkwrap-inline g-type-shrinkwrap-large-secondary');
        addEl('title', trackTitle);

        const trackLabel = document.createElement('span');
        trackLabel.classList.add('tracklist__label');
        addEl('label', trackLabel);

        const mediaLinks = document.createElement('div');
        mediaLinks.classList.add('tracklist__media');
        addEl('media', mediaLinks);

        heroArea.appendChild(tracklistArea);
    },
    update: (number, track) => {
        // Save the track globally for comparison in timer
        currentNum = number;
        console.log('Updating current track to', track.byArtist, track.name);

        heroTrack.els['number'].textContent = pad(number + 1, 2);
        heroTrack.els['cueTime'].textContent = track.cue;
        heroTrack.els['title'].textContent = track.byArtist + ' - ' + track.name;
        heroTrack.els['label'].textContent = track.publisher;

        // Replace media links
        while(heroTrack.els['media'].hasChildNodes()) {
            heroTrack.els['media'].removeChild(heroTrack.els['media'].lastChild);
        }
        for(let l in track.links) {
            heroTrack.addMedia(track.links[l].name, track.links[l].url);
        }

        let soundcloud = false;
        track.links.forEach(link => {
            if(link.name == 'soundcloud') {
                soundcloud = link;
            }
        });
        if(soundcloud) {
            heroTrack.els['title'].setAttribute('href', soundcloud.url);
            heroTrack.els['title'].setAttribute('data-tooltip', 'Visit SoundCloud page');
        } else {
            heroTrack.els['title'].removeAttribute('href');
            heroTrack.els['title'].setAttribute('data-tooltip', 'No SoundCloud link');
        }

        heroTrack.playerArea.classList.add('hasTracklist--active');
    },
    addMedia: (service, link) => {
        const mediaLink = document.createElement('a');
        mediaLink.classList.add('tracklist__mediaLink');
        mediaLink.setAttribute('href', link);
        mediaLink.setAttribute('target', '_blank');
        mediaLink.setAttribute('data-tooltip', service);
        mediaLink.innerHTML = '<img src="' + chrome.extension.getURL('img/icons/' + service + '.png') + '" alt="' + service + '">';
        heroTrack.els['media'].appendChild(mediaLink);
    }
};

const pad = (n, width, z = '0') => {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

module.exports = heroTrack;
