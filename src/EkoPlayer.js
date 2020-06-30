/* eslint-disable no-unused-vars */

class EkoPlayer {
    /**
     * Creates an instance of EkoPlayer.
     * @param {Element|string} el - The container element to be used by the player, or a DOM selector string for the container element.
     * @memberof EkoPlayer
     */
    constructor(el) {
        this._el = el;
        this.exports = this.exportPublicAPI();
        return this.exports;
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

    }

    /**
     * Will attempt to begin playing an eko project.
     *
     * @memberof EkoPlayer
     */
    play() {

    }

    /**
     * Will attempt to pause an eko project.
     *
     * @memberof EkoPlayer
     */
    pause() {

    }

    /**
     * Will call any player function defined on the developer site. Can also be used to set properties.
     *
     * @param {string} method - The player method to call or property to set
     * @param {*} args - Any arguments that should be passed into the method. Serializable only.
     * @memberof EkoPlayer
     */
    invoke(method, ...args) {

    }

    ///////////////////////////
    // PRIVATE FUNCTIONS
    //////////////////////////

    exportPublicAPI() {
        return {
            play: this.play.bind(this),
            pause: this.pause.bind(this),
            load: this.load.bind(this),
            invoke: this.invoke.bind(this)
        };
    }
}

export default EkoPlayer;
