import deepmerge from 'deepmerge';
import ekoPlatfrom from '../ekoPlatfrom';
import utils from '../utils';

const DEFAULT_OPTIONS = {
    env: '',
    iframeAttributes: {
        title: 'Eko Player',
        style: 'position: absolute; width: 100%; height: 100%; border: 0;',
        allowfullscreen: '',
        allow: 'autoplay *; fullscreen *',

        // These are currently experimental attributes, so they may not have any effect on some browsers
        importance: 'high',
        loading: 'eager'
    },
    params: {
        autoplay: true
    },
    pageParams: [
        'autoplay',
        'debug',
        /^utm_.*$/,
        'headnodeid',
        'clearcheckpoints',
        'profiler',
        'autoprofiler',
        'hidePauseOverlay',
        'studiorevision',
        'forceTech',
    ],

    // The default events are needed for the SDK itself.
    // Any additional events will be concatenated.
    events: [
        'canplay',
        'playing'
    ]
};

// Listening to some events requires embed params to be added to the iframe's src.
// This is a map of such events to their respective required embed params.
const EVENT_TO_EMBED_PARAMS_MAP = {
    'urls.intent': {
        urlsmode: 'proxy'
    },
    'share.intent': {
        sharemode: 'proxy'
    }
};

class EkoPlayerApi {
    constructor(iframe) {
        this.iframe = iframe;

        return {
            load: this.load.bind(this),
            invoke: this.invoke.bind(this)
        };
    }

    load(projectId, options) {
    // Deep merge of default options with provided options (arrays are concatenated).
        options = deepmerge.all([
            DEFAULT_OPTIONS,
            options || {},
            {
                params: {
                    embedapi: '1.0',
                    embedid: this.iframe.id
                }
            }
        ]);

        // Add embed params that are required for some events,
        // For example, if the "urls.intent" event is included, we must add the "urlsmode=proxy" embed param.
        Object.keys(EVENT_TO_EMBED_PARAMS_MAP)
            .forEach(event => {
                if (options.events.includes(event)) {
                    options.params = Object.assign(options.params, EVENT_TO_EMBED_PARAMS_MAP[event]);
                }
            });

        // Get rid of any duplications in arrays
        options.events = utils.uniq(options.events);
        options.pageParams = utils.uniq(options.pageParams);

        // Add events to our params
        options.params.events = options.events.join(',');

        // If EkoAnalytics exists on parent frame, pass the EA user id to the child frame
        /* eslint-disable new-cap */
        if (window.EkoAnalytics && window.EkoAnalytics('getUid')) {
            options.params.eauid = window.EkoAnalytics('getUid');
        }
        /* eslint-enable new-cap */

        // Custom cover was given, let's add a cover=false embed param to disable default cover.
        if (options.cover && (!options.params.hasOwnProperty('cover'))) {
            options.params.cover = false;
        }

        // Get the final embed params object
        // (merging params with selected page params to forward)
        const embedParams = Object.assign(
            {},
            options.params,
            utils.pick(
                utils.parseQueryParams(window.location.search),
                options.pageParams
            )
        );

        // Handle iframe attributes
        utils.setElAttributes(this.iframe, options.iframeAttributes);

        // Finally, let's set the iframe's src to begin loading the project
        this.iframe.setAttribute(
            'src',
            ekoPlatfrom.buildBalooUrl(projectId, embedParams, options.env)
        );
    }

    invoke(method, args) {
        if (typeof method !== 'string') {
            throw new Error('Expected required argument method to have type string');
        }

        const action = {
            type: `eko.${method}`,
            args: args
        };

        this.iframe.contentWindow.postMessage(action, '*');
    }
}

export default EkoPlayerApi;
