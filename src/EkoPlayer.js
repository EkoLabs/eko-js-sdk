import axios from 'axios';
import merge from 'lodash.merge';
import copySetterGetterFromInstance from './utils/copySetterGetterFromInstance';
import utils from './utils/utils';

let instanceCount = 0;
let DEFAULT_OPTIONS = {
    env: '',
    frameTitle: 'Eko Player',
    params: {
        autoplay: true
    },
    events: []
};
let DEFAULT_QUERY_PARAMS = ['autoplay', 'debug', /utm_*/, 'headnodeid'];
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
        this._iframe = utils.buildIFrame(`ekoframe-${++instanceCount}`);

        this._cover = '';
        this._autoplay = true;
        try {
            let container = utils.getContainer(el);
            if (container) {
                container.appendChild(this._iframe);
            }
        } catch (e) {
            throw e;
        }
        this.onEkoEventFired = this.onEkoEventFired.bind(this);
        this.addEventListeners();
        this.exports = this.exportPublicAPI();
        return this.exports;
    }

    set onEvent(eventCallback) {
        if (typeof eventCallback !== 'function') {
            throw new Error(`onEvent must be a function. Received ${typeof eventCallback} instead.`);
        }
        this._eventListener = eventCallback;
    }

    get onEvent() {
        return this._eventListener;
    }

    /**
     * Will return true if playing eko projects is supported in your current web browser.
     *
     * @returns
     * @memberof EkoPlayer
     */
    static isSupported() {
        // TODO: implement this
        return true;
    }

    /**
     * Will load and display an eko project.
     *
     * @param {string} projectId - id of the project to load
     * @param {object} options - loading options
     * @param {object} options.params - A list of embed params that will affect the delivery. Default includes {autoplay: true}.
     * @param {string[]} options.events - A list of events that should be forwarded to the app.
     * @param {Element|string} options.cover - An element or the query selector string for a loading cover. When loading happens a “eko-player-loading” class will be added to the element. When loading finishes, the “eko-player-loading” class will be removed. If no cover is provided, the default eko loading cover will be shown.
     * @param {string} options.frameTitle -  The title for the iframe.
     * @param {array} options.pageParams - Any query params from the page url that should be forwarded to the iframe. Can supply regex and strings. By default, the following query params will automatically be forwarded: autoplay, debug, utm_*, headnodeid
     * @returns Promise that will fail if the project id is invalid
     * @memberof EkoPlayer
     */
    load(projectId, options) {
        options = merge({}, DEFAULT_OPTIONS, options);

        if (options.cover) {
            try {
                this._cover = utils.getContainer(options.cover);
            } catch (e) {
                throw e;
            }
        }
        if (typeof options.frameTitle === 'string') {
            this._iframe.setAttribute('title', options.frameTitle);
        } else {
            throw new Error(`Received type ${typeof options.frameTitle}. Expected string.`);
        }

        if (typeof options.params.autoplay === 'boolean') {
            this._autoplay = options.params.autoplay;
        } else {
            throw new Error(`Received type ${typeof options.params.autoplay}. Expected boolean.`);
        }
        options.params.embedid = this._iframe.id;
        let pageparams = Array.isArray(options.pageParams) ? options.pageParams : DEFAULT_QUERY_PARAMS;
        let embedUrl = `https://eko.com/v/${projectId}/embed`;
        let projectUrl = utils.buildUrl(embedUrl, options, window.location.toString(), pageparams);
        this._iframe.setAttribute('src', projectUrl);
        if (options.cover) {
            this._cover.classList.add('eko-player-loading');
        }
    }

    /**
     * Will attempt to begin playing an eko project.
     *
     * @memberof EkoPlayer
     */
    play() {
        this.invoke('eko.play');
    }

    /**
     * Will attempt to pause an eko project.
     *
     * @memberof EkoPlayer
     */
    pause() {
        this.invoke('eko.pause');
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
            type: method,
            args: args
        };
        this._iframe.contentWindow.postMessage(action, '*');
    }

    /**
     * Retrieves the project info from the eko zuri APIs
     *
     * @param {string} projectId - project id to get info of
     * @param {object} options - change the env if necessary
     * @returns
     * @memberof EkoPlayer
     */
    getProjectInfo(projectId, options) {
        let env = (options && options.env) || '';
        return axios.get(`https://${env}api.eko.com/v1/projects/${projectId}`)
            .then((response) => {
                if (!response.data) {
                    throw new Error('Response is missing required data');
                }
                return response.data;
            })
            .catch((e) => {
                throw e;
            });
    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////

    exportPublicAPI() {
        let exportObj = {
            play: this.play.bind(this),
            pause: this.pause.bind(this),
            load: this.load.bind(this),
            invoke: this.invoke.bind(this),
            getProjectInfo: this.getProjectInfo.bind(this)
        };
        copySetterGetterFromInstance(this, exportObj, 'onEvent');
        return exportObj;
    }

    onEkoEventFired(event) {
        if (!utils.isEkoDomain(event.origin)) {
            return;
        }

        const msg = event.data;
        if (msg.type && msg.embedid === this._iframe.id) {
            const shouldRemoveCover = this._cover &&
                (
                    (msg.type === 'eko.playing' && this._autoplay) ||
                    (msg.type === 'eko.canplay' && !this._autoplay)
                );
            if (shouldRemoveCover) {
                this._cover.classList.remove('eko-player-loading');
            }

            if (this._eventListener) {
                this._eventListener(msg);
            }
        }
    }

    addEventListeners() {
        window.addEventListener('message', this.onEkoEventFired);
    }

    removeEventListeners() {
        window.removeEventListener('message', this.onEkoEventFired);
    }
}

export default EkoPlayer;
