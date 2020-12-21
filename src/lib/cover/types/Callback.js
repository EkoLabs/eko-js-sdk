class Callback {
    constructor(cover) {
        this.cover = cover;
        return {
            setState: this.setState.bind(this)
        };
    }

    setState(state, options) {
        if (arguments.length === 1) {
            this.cover(state);
        } else if (arguments.length > 1) {
            this.cover(state, options);
        }
    }
}

export default Callback;
