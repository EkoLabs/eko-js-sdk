/* eslint-disable new-cap */
import v1 from './v1';
import v2 from './v2';

const imples = {
    '1.0': v1,
    '2.0': v2
};

function create(iframe, embedapiVersion) {
    const ekoEmbed = imples[embedapiVersion];
    if (!ekoEmbed) {
        throw new Error('Invalid Embed API version');
    }
    return new ekoEmbed(iframe);
}

export default { create };
