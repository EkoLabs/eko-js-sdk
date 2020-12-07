import EventEmitter from 'eventemitter3';
import ekoPlatform from '../ekoPlatfrom';

/*
* Private function. Will emit an event and pass its arguments.
*/

class EmbedEventSystem {
    constructor(iframe) {
        this.iframe = iframe;
        this.eventEmitter = new EventEmitter();
        this.addIframeListeners();

        return {
            on: this.on.bind(this),
            off: this.off.bind(this),
            once: this.once.bind(this)
        };
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

    addIframeListeners() {
        window.addEventListener('message', this.onEkoEventFired);
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

        this.trigger(msg.type.replace(/^eko./, ''), msg.args);
    }

    trigger(eventName, ...args) {
        this.eventEmitter.emit(eventName, ...args);
    }
}

export default EmbedEventSystem;

