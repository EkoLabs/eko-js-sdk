import deepmerge from 'deepmerge';
import EventEmitter from 'eventemitter3';

import coverFactory from './lib/cover/coverFactory';
import utils from './lib/utils';

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

let instanceCount = 0;
let isEkoSupported = null;

class EkoPlayer {
    /**
     * Creates an instance of EkoPlayer.
     * @param {Element|string} el - The container element to be used by the player, or a DOM selector string for the container element.
     * @memberof EkoPlayer
     */
    constructor(el) {
        if (!el) {
            throw new Error('Constructor must get an element (or selector) as first argument.');
        }
        if (!EkoPlayer.isSupported()) {
            throw new Error('Cannot initialize EkoPlayer instance as Eko videos are not supported on current environment.'); // eslint-disable-line max-len
        }

        // Initialize private members
        this._iframe = utils.buildIFrame(`ekoembed-${++instanceCount}`);
        this._eventEmitter = new EventEmitter();

        // Bind Listeners
        this.onEkoEventFired = this.onEkoEventFired.bind(this);

        // Attach event listeners
        this.addEventListeners();

        // Append our iframe to provided DOM element/container
        utils.getContainer(el).appendChild(this._iframe);

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
        // Deep merge of default options with provided options (arrays are concatenated).
        options = deepmerge.all([
            DEFAULT_OPTIONS,
            options || {},
            {
                params: {
                    embedapi: '1.0',
                    embedid: this._iframe.id
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
        utils.setElAttributes(this._iframe, options.iframeAttributes);

        // Finally, let's set the iframe's src to begin loading the project
        this._iframe.setAttribute(
            'src',
            utils.buildEmbedUrl(projectId, embedParams, options.env)
        );
    }

    /**
     * Will attempt to begin playing an eko project.
     *
     * @memberof EkoPlayer
     */
    play() {
        this.invoke('play');
    }

    /**
     * Will attempt to pause an eko project.
     *
     * @memberof EkoPlayer
     */
    pause() {
        this.invoke('pause');
    }

    /**
     * Will call any player function defined on the developer site. Can also be used to set properties.
     *
     * @param {string} method - The player method to call or property to set
     * @param {*} args - Any arguments that should be passed into the method. Serializable only.
     * @memberof EkoPlayer
     */
    invoke(method, ...args) {
        if (typeof method !== 'string') {
            throw new Error('Expected required argument method to have type string');
        }
        const action = {
            type: `eko.${method}`,
            args: args
        };
        this._iframe.contentWindow.postMessage(action, '*');
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
        this._eventEmitter.on(eventName, callback);
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
        this._eventEmitter.off(eventName, callback);
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
        this._eventEmitter.once(eventName, callback);
    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////

    /*
     * Private function. Will emit an event and pass its arguments.
     */
    trigger(eventName, ...args) {
        this._eventEmitter.emit(eventName, ...args);
    }

    onEkoEventFired(event) {
        if (!utils.isEkoDomain(event.origin)) {
            return;
        }

        const msg = event.data;

        // Do nothing if this message was not intended for us
        if (!msg.type || msg.embedId !== this._iframe.id) {
            return;
        }

        this.trigger.apply(this, [msg.type.replace(/^eko./, '')].concat(msg.args));
    }

    addEventListeners() {
        window.addEventListener('message', this.onEkoEventFired);
    }
}

export default EkoPlayer;
