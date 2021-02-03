import EventEmitter from 'eventemitter3';
import ekoPlatform from '../ekoPlatform';
import { stringifyQueryParams } from '../queryParamsUtils';
import deepmerge from 'deepmerge';

class EkoEmbedV2 {
    constructor(iframe) {
        this.iframe = iframe;
        this.eventEmitter = new EventEmitter();
        this.addIframeListeners();

        return {
            load: this.load.bind(this),
            invoke: this.invoke.bind(this),
            on: this.on.bind(this),
            off: this.off.bind(this),
            once: this.once.bind(this)
        };
    }


    load(id, options) {
        let embedParams = {
            id,
            embedapi: '2.0',
            embedid: this.iframe.id,
            events: options.events.join(',')
        };
        embedParams = deepmerge.all([embedParams, options.params]);

        const clientSideParams = options.clientSideParams;
        if (clientSideParams && typeof clientSideParams === 'object') {
            embedParams.csp = true;
            this.once('loader.csp.ready', () => {
                this.iframe.contentWindow.postMessage({ target: 'loader', csp: clientSideParams }, '*');
            });
        }

        // Finally, let's set the iframe's src to begin loading the project
        this.iframe.setAttribute(
            'src',
            `https://${options.env || ''}embed.eko.com/?${stringifyQueryParams(embedParams)}`
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
    on(eventName, callback) {
        this.eventEmitter.on(eventName, callback);
    }

    off(eventName, callback) {
        this.eventEmitter.off(eventName, callback);
    }

    once(eventName, callback) {
        this.eventEmitter.once(eventName, callback);
    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////
    addIframeListeners() {
        window.addEventListener('message', this.onEkoEventFired.bind(this));
    }

    onEkoEventFired(event) {
        if (!ekoPlatform.isEkoDomain(event.origin)) {
            return;
        }

        const msg = event.data;

        // Do nothing if this message was not intended for us
        if (!msg.event || msg.embedid !== this.iframe.id || msg.embedapi !== '2.0') {
            return;
        }

        this.eventEmitter.emit(msg.event, ...msg.args);
    }
}

export default EkoEmbedV2;
