import utils from './../../utils';

const COVER_STATE_CLASSES = {
    loading: 'eko-player-loading',
    loaded: 'eko-player-loaded',
    started: 'eko-player-started',
};

class DomEl {
    constructor(cover) {
        this.cover = utils.getContainer(cover);
    }

    setState(state) {
        Object.values(COVER_STATE_CLASSES).forEach(calssName => {
            this.cover.classList.remove(calssName);
        });
        this.cover.classList.add(COVER_STATE_CLASSES[state]);
    }
}

export default DomEl;
