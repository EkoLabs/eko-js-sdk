/* eslint-disable new-cap */

import v2 from './v2';
import v1 from './v1';

function create(embedapiVersion) {
    switch (embedapiVersion) {
        case '2.0':
            return v2;
        default:
            return v1;
    }
}

export default create;
