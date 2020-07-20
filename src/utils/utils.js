function addQueryStringParams(uri, queryParams) {
    for (var key in queryParams) {
        // eslint-disable-next-line no-negated-condition
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';
        uri += (separator + key + '=' + queryParams[key]);
    }

    return uri;
}

function buildUrl(embedUrl, options) {
    if (!embedUrl) {
        throw new Error('Missing required param embedUrl');
    }
    if (!options) {
        throw new Error('Missing required param options');
    }
    let params = Object.assign({}, options.params);
    params.embedapi = '1.0';
    let hascover = options.cover !== undefined;
    let events = options.events || [];
    if (hascover) {
        if (options.params.autoplay) {
            if (!events.find(val => val === 'eko.playing')) {
                events.push('eko.playing');
            }
        } else if (!events.find(val => val === 'eko.canplay')) {
            events.push('eko.canplay');
        }
    }

    // If the events array includes share.intent, then the iframe should not handle share functionality
    // Include `sharemode=proxy` into the project url so that the share.intent event gets forwarded from
    // the share plugin.
    if (events.includes('share.intent')) {
        params.sharemode = 'proxy';
    }
    if (events.includes('urls.intent')) {
        params.urlmode = 'proxy';
    }
    if (events.length !== 0) {
        let eventList = events.join(',');
        params.events = eventList;
    }
    return addQueryStringParams(embedUrl, params);
}

function isEkoDomain(domain) {
    return (/https?:\/\/(.*?\.)?eko.com/.test(domain));
}

function getContainer(el) {
    let retVal = null;

    if (!el) {
        throw new Error('Expecting an element (or selector) as first argument.');
    } else if (typeof el === 'string') {
        // Otherwise, if el is a string (selector)
        try {
            retVal = document.querySelector(el);
        } catch (e) { }

        if (!retVal) {
            throw new Error(`Could not successfully resolve selector: ${el}`);
        }
    } else {
        // Otherwise, el is assumed to be the container <div> element itself.
        retVal = el;
    }

    if (!retVal || typeof retVal.appendChild !== 'function') {
        throw new Error(`Could not resolve DOM element.`);
    }

    return retVal;
}

function buildIFrame(id) {
    let iframe = document.createElement('iframe');
    iframe.setAttribute('id', id);
    iframe.setAttribute('title', 'Eko Player');
    iframe.setAttribute('style', 'position: absolute; width: 100%; height: 100%; border: 0;');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen');

    // These are currently experimental attributes, so they may not have any effect on some browsers
    iframe.setAttribute('importance', 'high');
    iframe.setAttribute('loading', 'eager');

    return iframe;
}

export default {
    buildUrl: buildUrl,
    buildIFrame: buildIFrame,
    isEkoDomain: isEkoDomain,
    getContainer: getContainer,
};
