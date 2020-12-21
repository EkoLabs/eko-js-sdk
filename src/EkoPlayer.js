import ekoEmbedFactory from './lib/ekoEmbed/factory';
import coverFactory from './lib/cover/factory';
import iframeCreator from './lib/iframeCreator';

import deepmerge from 'deepmerge';
import utils from './lib/utils';
import { parseQueryParams } from './lib/queryParamsUtils';

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

// All player states (used for cover functionality)
const COVER_STATES = {
    LOADING: 'loading',
    LOADED: 'loaded',
    STARTED: 'started',
};

let isEkoSupported = null;

class EkoPlayer {
    /**
     * Creates an instance of EkoPlayer.
     * @param {Element|string} el - The container element to be used by the player, or a DOM selector string for the container element.
     * @param {string} embedapi - embed api version
     * @memberof EkoPlayer
     */
    constructor(el, embedapi) {
        if (!el) {
            throw new Error('Constructor must get an element (or selector) as first argument.');
        }
        if (!EkoPlayer.isSupported()) {
            throw new Error('Cannot initialize EkoPlayer instance as Eko videos are not supported on current environment.'); // eslint-disable-line max-len
        }

        this.iframe = iframeCreator.create();
        this.ekoEmbed = ekoEmbedFactory.create(this.iframe, embedapi || '1.0');

        // Append our iframe to provided DOM element/container
        utils.getContainer(el).appendChild(this.iframe);

        // Return our public API from the constructor
        return {
            play: this.play.bind(this),
            pause: this.pause.bind(this),
            load: this.load.bind(this),
            invoke: this.invoke.bind(this),
            on: this.on.bind(this),
            once: this.once.bind(this),
            off: this.off.bind(this)
        };
    }

    /**
     * Will return true if playing eko projects is supported in your current web browser.
     *
     * @returns
     * @memberof EkoPlayer
     */
    static isSupported() {
        if (isEkoSupported === null) {
            isEkoSupported =
                typeof window !== 'undefined' && // Added to support SSR
                utils.isES6Supported() &&
                utils.isWebAudioSupported();
        }
        return isEkoSupported;
    }

    /**
     * Will load and display an eko project.
     *
     * @param {string} projectId - id of the project to load
     * @param {object} [options] - loading options
     * @param {object} [options.params] - A list of embed params that will affect the delivery. Default includes {autoplay: true}.
     * @param {string[]} [options.events] - A list of events that should be forwarded to the app.
     * @param {Element|string|function} [options.cover] - An element or the query selector string for a loading cover.
     * When loading happens a “eko-player-loading” class will be added to the element.
     * When loading finishes, the “eko-player-loading” class will be removed.
     * If a function is passed, it will be invoked with a single string argument (state) whenever the state changes.
     * The possible state values are "loading" (cover should be shown) and "loaded" (cover should be hidden).
     * If no cover is provided, the default eko loading cover will be shown.
     * @param {object} [options.iframeAttributes] - standard attributes of iframe HTML element
     * @param {array} [options.pageParams] - Any query params from the page url that should be forwarded to the iframe. Can supply regex and strings. By default, the following query params will automatically be forwarded: autoplay, debug, utm_*, headnodeid
     * @returns Promise that will fail if the project id is invalid
     * @memberof EkoPlayer
     */
    load(projectId, options) {
        if (!projectId || typeof projectId !== 'string') {
            throw new Error('Invalid projectId arg passed to load() method, expected a non-empty string');
        }
        options = this.prepareLoadingOptions(options);

        // Handle cover
        let cover = coverFactory.create(options.cover);

        // LOADING
        cover.setState(COVER_STATES.LOADING);

        // LOADED
        this.once('canplay', (buffered, isAutoplayExpected) => {
            cover.setState(COVER_STATES.LOADED, { buffered, isAutoplayExpected });
        });

        // STARTED
        this.once('playing', () => {
            cover.setState(COVER_STATES.STARTED);
        });

        // Handle iframe attributes
        utils.setElAttributes(this.iframe, options.iframeAttributes);

        this.ekoEmbed.load(projectId, options);
    }

    /**
     * Will attempt to begin playing an eko project.
     *
     * @memberof EkoPlayer
     */
    play() {
        this.invoke('play', []);
    }

    /**
     * Will attempt to pause an eko project.
     *
     * @memberof EkoPlayer
     */
    pause() {
        this.invoke('pause', []);
    }

    /**
     * Will call any player function defined on the developer site. Can also be used to set properties.
     *
     * @param {string} method - The player method to call or property to set
     * @param {*} args - Any arguments that should be passed into the method. Serializable only.
     * @memberof EkoPlayer
     */
    invoke(method, ...args) {
        this.ekoEmbed.invoke(method, args);
    }

    /**
     * Event emitter function that will let a module register a callback for a specified event issued from
     * the EkoPlayer.
     *
     * @param {String} eventName
     * @param {function} callback
     * @memberof EkoPlayer
     */
    on(eventName, callback) {
        this.ekoEmbed.on(eventName, callback);
    }

    /**
     * Event emitter function that will let a module remove a callback for a specified event issued from
     * the EkoPlayer.
     *
     * @param {String} eventName
     * @param {function} callback
     * @memberof EkoPlayer
     */
    off(eventName, callback) {
        this.ekoEmbed.off(eventName, callback);
    }

    /**
     * Event emitter function that will let a module register a callback for a specified event
     * from the EkoPlayer. The callback will only be called once, while the event may
     * be emitted more than once.
     *
     * @param {String} eventName
     * @param {function} callback
     * @memberof EkoPlayer
     */
    once(eventName, callback) {
        this.ekoEmbed.once(eventName, callback);
    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////

    prepareLoadingOptions(options) {
        options = deepmerge.all([DEFAULT_OPTIONS, (options || {})]);

        options.events = utils.uniq(options.events);
        options.pageParams = utils.uniq(options.pageParams);

        // Add embed params that are required for some events,
        // For example, if the "urls.intent" event is included, we must add the "urlsmode=proxy" embed param.
        Object.keys(EVENT_TO_EMBED_PARAMS_MAP)
            .forEach(event => {
                if (options.events.includes(event)) {
                    options.params = Object.assign(options.params, EVENT_TO_EMBED_PARAMS_MAP[event]);
                }
            });

        // If EkoAnalytics exists on parent frame, pass the EA user id to the child frame
        /* eslint-disable new-cap */
        if (window.EkoAnalytics && window.EkoAnalytics('getUid')) {
            options.params.eauid = window.EkoAnalytics('getUid');
        }
        /* eslint-enable new-cap */

        const forwardParams = utils.pick(parseQueryParams(window.location.search), options.pageParams);
        options.params = deepmerge.all([options.params, forwardParams]);

        return options;
    }
}

export default EkoPlayer;
