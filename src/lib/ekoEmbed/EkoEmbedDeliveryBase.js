import EventEmitter from 'eventemitter3';
import ekoPlatform from '../ekoPlatform';
import { stringifyQueryParams } from '../queryParamsUtils';
import deepmerge from 'deepmerge';

const MSG_FROM_IDENTIFIER = 'eko.js-sdk';
const CHILD_EMBED_API_IDENTIFIER = 'eko.embedapi';

class EkoEmbedDeliveryBase {
    constructor(servicepath, embedapi, embedpath, iframe) {
        this.servicepath = servicepath;
        this.embedapi = embedapi || '2.0';
        this.embedpath = embedpath || '/';
        this.iframe = iframe;
        this.eventEmitter = new EventEmitter();
        this.onEkoEventFired = this.onEkoEventFired.bind(this);
        this.addIframeListeners();

        return {
            load: this.load.bind(this),
            invoke: this.invoke.bind(this),
            sendMsg: this.sendMsg.bind(this),
            on: this.on.bind(this),
            off: this.off.bind(this),
            once: this.once.bind(this),
            dispose: this.dispose.bind(this)
        };
    }

    getDeliveryUrl(embedParams, options) {
        const host = options.host ? `${options.host}` : `${options.env || ''}${this.servicepath}`;
        return `https://${host}${this.embedpath}?${stringifyQueryParams(embedParams)}`;
    }

    load(id, options) {
        let embedParams = {
            id,
            embedapi: this.embedapi,
            embedid: this.iframe.id,
            events: options.events.join(',')
        };
        embedParams = deepmerge.all([embedParams, options.params]);

        let clientSideParams = options.clientSideParams;
        if (clientSideParams && (typeof clientSideParams === 'object' || typeof clientSideParams === 'function')) {
            // Normalize clientSideParams - if it's an object, convert it into a function that returns that object
            if (typeof clientSideParams === 'object') {
                const cspObj = clientSideParams;
                clientSideParams = () => cspObj;
            }

            embedParams.csp = true;
            this.once('loader.csp.ready', () => {
                Promise.resolve()
                    .then(clientSideParams)
                    .then((csp) => {
                        this.iframe.contentWindow.postMessage({ target: 'loader', csp }, '*');
                    });
            });
        }

        // Finally, let's set the iframe's src to begin loading the project
        this.iframe.setAttribute(
            'src',
            this.getDeliveryUrl(embedParams, options)
        );
    }

    invoke(method, args) {
        if (typeof method !== 'string') {
            throw new Error('Expected required argument method to have type string');
        }

        const action = {
            target: 'embedapi',
            playerProperty: `${method}`,
            args: args
        };

        this.iframe.contentWindow.postMessage(action, '*');
    }

    sendMsg(type, data) {
        let msg = {
            from: MSG_FROM_IDENTIFIER,
            to: CHILD_EMBED_API_IDENTIFIER,

            type,
            data
        };

        this.iframe.contentWindow.postMessage(msg, '*');
    }

    on(eventName, callback) {
        this.eventEmitter.on(eventName, callback);
    }

    off(eventName, callback) {
        this.eventEmitter.off(eventName, callback);
    }

    once(eventName, callback) {
        this.eventEmitter.once(eventName, callback);
    }

    dispose() {
        this.removeIframeListeners();
    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////
    addIframeListeners() {
        window.addEventListener('message', this.onEkoEventFired);
    }

    removeIframeListeners() {
        window.removeEventListener('message', this.onEkoEventFired);
    }

    onEkoEventFired(event) {
        // MY TODO: ok to add localhost always?
        if (!ekoPlatform.isEkoDomain(event.origin) && event.origin !== 'http://localhost:5023') {
            return;
        }

        const msg = event.data;

        // MY TODO: comment - only handle messages that intended for us
        // MY TODO: v2 - from => eko.embedapi
        // MY TODO: v1 - msg.event exists
        // eslint-disable-next-line max-len
        if (msg.from === CHILD_EMBED_API_IDENTIFIER && msg.embedId === this.iframe.id && msg.embedApiVersion === this.embedapi) {
            this.eventEmitter.emit(msg.type, msg);
        } else if (msg.event && msg.embedid === this.iframe.id && msg.embedapi === this.embedapi) {
            this.eventEmitter.emit(msg.event, ...msg.args);
        }
    }
}

export default EkoEmbedDeliveryBase;
