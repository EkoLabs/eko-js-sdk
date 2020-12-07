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
        window.addEventListeners('message', this.onEkoEventFired);
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

        this.eventEmitter.emit(msg.event, msg.args, msg.embedid, msg.embedapi);
    }
}

export default EmbedEventSystem;

