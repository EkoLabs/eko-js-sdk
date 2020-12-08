/* eslint-disable new-cap */
import v1 from './v1';
import v2 from './v2';

const imples = {
    '1.0': v1,
    '2.0': v2
};

function create(iframe, embedapiVersion) {
    const ekoDelivery = imples[embedapiVersion];
    if (!ekoDelivery) {
        throw new Error('');
    }
    return new ekoDelivery(iframe);
}

export default { create };
