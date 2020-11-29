import featureDetectES6 from 'feature-detect-es6';

function uniq(arr) {
    if (!Array.isArray(arr)) {
        throw new TypeError(`[uniq] Expected array, instead got ${typeof arr}`);
    }

    return [...new Set(arr)];
}

/**
 * Returns a new object with a subset of properties from original object.
 * @param {object} object - Source object.
 * @param {(string|RegExp)[]} keys - Array of keys to pick from source object onto target object. RegExp is also supported.
 */
function pick(object, keys) {
    return keys.reduce((obj, key) => {
        if (key instanceof RegExp) {
            Object.keys(object).forEach((objectKey) => {
                if (key.test(objectKey)) {
                    obj[objectKey] = object[objectKey];
                }
            });
        } else if (object && object.hasOwnProperty(key)) {
            obj[key] = object[key];
        }

        return obj;
    }, {});
}

function parseQueryParams(queryStr) {
    let retVal = {};
    let searchParams = new URLSearchParams(queryStr);

    searchParams.forEach((value, key) => {
        retVal[key] = value;
    });

    return retVal;
}

function stringifyQueryParams(queryObj) {
    let searchParams = new URLSearchParams();

    Object.keys(queryObj).forEach((key) => {
        searchParams.set(key, queryObj[key]);
    });

    return searchParams.toString();
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

function buildEmbedUrl(projectId, embedParamsObj, env, useDeliveryService) {
    return useDeliveryService ?
        `https://${env}embed.eko.com/?id=${projectId}&${stringifyQueryParams(embedParamsObj)}` :
        `https://${env ? (env + '.') : ''}eko.com/v/${projectId}/embed?${stringifyQueryParams(embedParamsObj)}`;
}

function buildIFrame(id) {
    let iframe = document.createElement('iframe');
    iframe.setAttribute('id', id);
    return iframe;
}

function isES6Supported() {
    return featureDetectES6.all(
        'class',
        'arrowFunction',
        'let',
        'const',
        'newArrayFeatures',
        'newObjectFeatures',
        'collections',
        'promises',
        'templateStrings',
        'destructuring',
        'spread',
        'defaultParamValues'
    );
}

function isWebAudioSupported() {
    return !!(
        window.AudioContext ||
        window.webkitAudioContext
    );
}

export default {
    pick,
    parseQueryParams,
    stringifyQueryParams,
    buildEmbedUrl,
    buildIFrame,
    isEkoDomain,
    getContainer,
    uniq,
    isES6Supported,
    isWebAudioSupported,
};
