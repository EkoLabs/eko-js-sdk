/* eslint-disable new-cap */
import v2 from './v2';
import v1 from './v1';

function create(embedapiVersion, iframe, eventEmitter) {
    switch (embedapiVersion) {
        case '2.0':
            return new v2(iframe, eventEmitter);
        default:
            return new v1(iframe, eventEmitter);
    }
}

export default { create };
