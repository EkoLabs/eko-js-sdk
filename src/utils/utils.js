import merge from 'lodash.merge';

function addQueryStringParams(uri, queryParams) {
    for (var key in queryParams) {
        // eslint-disable-next-line no-negated-condition
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';
        uri += (separator + key + '=' + queryParams[key]);
    }

    return uri;
}

function extractQueryParams(url, params) {
    let urlcomponents = url.split('?');
    if (urlcomponents.length < 2) {
        return;
    }
    let queryparams = urlcomponents[1];
    let finalObj = {};
    let pairs = queryparams.split('&');
    pairs.reduce(function(map, pair) {
        let keyVal = pair.split('=');

        // Params can be strings or regex. Check if there are any matches
        let matches = params.filter((val) => {
            return (keyVal[0].match(val));
        });
        if (Array.isArray(keyVal) && keyVal.length === 2 && matches.length !== 0) {
            map[keyVal[0]] = keyVal[1];
        }
        return map;
    }, finalObj);
    return finalObj;
}

function buildUrl(embedUrl, embedOptions, pageUrl, pageParams) {
    if (!embedUrl) {
        throw new Error('Missing required param embedUrl');
    }
    if (!embedOptions) {
        throw new Error('Missing required param embedOptions');
    }
    if (pageParams && !pageUrl) {
        throw new Error('Provided page params but no page url');
    }
    if (pageParams && !Array.isArray(pageParams)) {
        throw new Error('Pageparams must be an array');
    }
    let params = pageParams ? Object.assign({}, extractQueryParams(pageUrl, pageParams)) : {};
    params = merge(params, embedOptions.params);
    params.embedapi = '1.0';
    let hascover = embedOptions.cover !== undefined;
    let events = embedOptions.events || [];
    if (hascover) {
        if (embedOptions.params.autoplay) {
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
    extractQueryParams: extractQueryParams
};
