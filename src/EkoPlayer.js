import axios from 'axios';
import copySetterGetterFromInstance from './utils/copySetterGetterFromInstance';
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
        this._iframe = document.createElement('iframe');
        this._iframe.frameBorder = 0;
        this._iframe.width = '100%';
        this._iframe.height = '100%';
        this._iframe.id = 'ekoPlayer';
        this._iframe.title = 'Eko Player';

        let container = this.getContainer(el);
        if (container) {
            container.appendChild(this._iframe);
        }
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
     * @memberof EkoPlayer
     */
    load(projectId, options) {
        let env = '';
        if (options && options.env) {
            env = `${options.env}.`;
        }

        axios.get(`https://${env}eko.com/api/v1/projects/${projectId}`)
            .then((response) => {
                if (response.data) {
                    let embedUrl = response.data.embedUrl;
                    let projectUrl = this.buildUrl(embedUrl, options);
                    this._iframe.setAttribute('src', projectUrl);
                }
            })
            .catch((error) => {
                throw error;
            });
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
    // eslint-disable-next-line no-unused-vars
    invoke(method, ...args) {
        if (typeof method !== 'string') {
            throw new Error('Expected required argument method of type string');
        }
        const action = {
            type: method,
            args: args
        };
        this._iframe.contentWindow.postMessage(action, '*');
    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////

    exportPublicAPI() {
        let exportObj = {
            play: this.play.bind(this),
            pause: this.pause.bind(this),
            load: this.load.bind(this),
            invoke: this.invoke.bind(this)
        };
        copySetterGetterFromInstance(this, exportObj, 'onEvent');
        return exportObj;
    }

    getContainer(el) {
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
            throw new Error(`Could not resolve container DOM element.`);
        }

        return retVal;
    }

    buildUrl(embedUrl, options) {
        let params = (options && options.param) || { autoplay: true };
        let hascover = options && options.cover !== undefined;
        let events = (options && options.events) || [];

        let projectUrl = `${embedUrl}?embedapi=1.0`;
        Object.keys(params).forEach((key) => {
            projectUrl = `${projectUrl}&${key}=${params[key]}`;
        });
        if (hascover) {
            if (options.params.autoplay) {
                if (!events.find(val => val === 'eko.playing')) {
                    events.push('eko.playing');
                }
            } else if (!events.find(val => val === 'eko.canplay')) {
                events.push('eko.canplay');
            }
        }
        let eventList = events.join(',');
        projectUrl = `${projectUrl}&events=${eventList}`;
        return projectUrl;
    }

    onEkoEventFired(event) {
        if (!/https?:\/\/(.*?\.)?eko.com/.test(event.origin)) {
            return;
        }
        const msg = event.data;
        if (event.data.type && this._eventListener) {
            this._eventListener(msg);
        }
    }

    addEventListeners() {
        window.addEventListener('message', this.onEkoEventFired.bind(this));
    }

    removeEventListeners() {
        window.removeEventListener('message', this.onEkoEventFired);
    }
}

export default EkoPlayer;
