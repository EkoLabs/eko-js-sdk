class CallBack {
    constructor(cover) {
        this.cover = cover;
    }

    setState(state, options) {
        if (arguments.length === 1) {
            this.cover(state);
        } else if (arguments.length > 1) {
            this.cover(state, options);
        }
    }
}

export default CallBack;
