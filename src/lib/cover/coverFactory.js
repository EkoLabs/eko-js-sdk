import CallbackCover from './types/Callback';
import DomElCover from './types/DomEl';
import NullCover from './types/Null';

function create(cover) {
    switch (typeof cover) {
        case 'function':
            return new CallbackCover(cover);
        case 'object':
        case 'string':
            return new DomElCover(cover);
        default:
            return new NullCover();
    }
}

export default {
    create
};
