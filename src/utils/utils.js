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

function uniq(arr) {
    if (!Array.isArray(arr)) {
        throw new TypeError(`[uniq] Expected array, instead got ${typeof arr}`);
    }

    return [...new Set(arr)];
}

function buildUrl(embedUrl, embedOptions) {
    if (!embedUrl) {
        throw new Error('Missing required param embedUrl');
    }
    if (!embedOptions) {
        throw new Error('Missing required param embedOptions');
    }
    if (embedOptions.pageParams && !Array.isArray(embedOptions.pageParams)) {
        throw new Error('pageParams must be an array');
    }
    let params = embedOptions.pageParams ?
        Object.assign({}, extractQueryParams(window.location.toString(), embedOptions.pageParams)) :
        {};
    params = Object.assign(params, embedOptions.params);

    let events = embedOptions.events || [];

    if (events.length !== 0) {
        let eventList = events.join(',');
        params.events = eventList;
    }
    return addQueryStringParams(embedUrl, params);
}

function isEkoDomain(domain) {
    return /https?:\/\/(.*?\.)?eko.com/.test(domain);
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
    buildUrl,
    buildIFrame,
    isEkoDomain,
    getContainer,
    extractQueryParams,
    uniq,
};
