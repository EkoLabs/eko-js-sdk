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

export default PrivateApi;

