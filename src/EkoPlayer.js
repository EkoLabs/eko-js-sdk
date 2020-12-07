import ekoPlayerApiFactory from './lib/ekoPlayerApi/factory';
import embedMessageSystemFactory from './lib/embedMessageSystem/factory';
import coverFactory from './lib/cover/coverFactory';
import utils from './lib/utils';

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
    constructor(el, embedapi) {
        if (!el) {
            throw new Error('Constructor must get an element (or selector) as first argument.');
        }
        if (!EkoPlayer.isSupported()) {
            throw new Error('Cannot initialize EkoPlayer instance as Eko videos are not supported on current environment.'); // eslint-disable-line max-len
        }

        // Initialize private members
        const iframe = utils.buildIFrame(`ekoembed-${++instanceCount}`);

        embedapi = embedapi || '1.0';
        this.embedMessageSystem = embedMessageSystemFactory.create(iframe, embedapi);
        this.ekoPlayerApi = ekoPlayerApiFactory.create(iframe, embedapi);

        // TODO: not here!!!! yes ?? no ??
        // Append our iframe to provided DOM element/container
        utils.getContainer(el).appendChild(iframe);

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
                typeof window !== 'undefined' &&
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

        this.ekoPlayerApi.load(projectId, options);
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
        this.ekoPlayerApi.invoke(method, args);
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
        this.embedMessageSystem.on(eventName, callback);
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
        this.embedMessageSystem.off(eventName, callback);
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
        this.embedMessageSystem.once(eventName, callback);
    }
}

export default EkoPlayer;
