import ekoPlatform from './../utils';

/*
* Private function. Will emit an event and pass its arguments.
*/

class PrivateApi {
    constructor(iframe, eventEmitter) {
        this.iframe = iframe;
        this.eventEmitter = eventEmitter;

        return {
            addIframeListeners: this.addIframeListeners.bind(this)
        };
    }

    addIframeListeners() {
        window.addEventListeners('message', this.onEkoEventFired);
    }

    trigger(eventName, ...args) {
        this.eventEmitter.emit(eventName, ...args);
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
}

export default PrivateApi;

