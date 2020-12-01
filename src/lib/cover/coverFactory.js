import CallbackCover from './covers/Callback';
import DomElCover from './covers/DomEl';
import NullCover from './covers/Null';

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
