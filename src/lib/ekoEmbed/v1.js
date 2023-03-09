import EventEmitter from 'eventemitter3';
import ekoPlatform from '../ekoPlatform';
import { stringifyQueryParams } from '../queryParamsUtils';


class EkoEmbedV1 {
    constructor(iframe) {
        this.iframe = iframe;
        this.eventEmitter = new EventEmitter();
        this.onEkoEventFired = this.onEkoEventFired.bind(this);
        this.addIframeListeners();

        return {
            load: this.load.bind(this),
            invoke: this.invoke.bind(this),
            on: this.on.bind(this),
            off: this.off.bind(this),
            once: this.once.bind(this),
            dispose: this.dispose.bind(this),

            // eslint-disable-next-line no-console
            sendMsg: () => { console.warn('"sendMsg()" method is not implemented for v1'); }, // MY TODO: review...
        };
    }

    load(id, options) {
        let embedParams = options.params || {};
        embedParams.embedapi = '1.0';
        embedParams.embedid = this.iframe.id;
        embedParams.events = options.events.join(',');

        // Custom cover was given, let's add a cover=false embed param to disable default cover.
        if (options.cover && (!embedParams.hasOwnProperty('cover'))) { // eslint-disable-line no-prototype-builtins
            embedParams.cover = false;
        }

        const env = options.env ? `${options.env}.` : '';
        const queryString = stringifyQueryParams(embedParams);
        this.iframe.setAttribute(
            'src',
            `https://${env}eko.com/v/${id}/embed?${queryString}`
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
        if (!ekoPlatform.isEkoDomain(event.origin)) {
            return;
        }

        const msg = event.data;

        // Do nothing if this message was not intended for us
        if (!msg.type || msg.embedId !== this.iframe.id) {
            return;
        }

        this.trigger(msg.type.replace(/^eko./, ''), ...msg.args);
    }

    trigger(eventName, ...args) {
        this.eventEmitter.emit(eventName, ...args);
    }
}

export default EkoEmbedV1;
