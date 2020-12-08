/* eslint-disable new-cap */
import v1 from './v1';
import v2 from './v2';

const imples = {
    '1.0': v1,
    '2.0': v2
};

function create(iframe, embedapiVersion) {
    const ekoPlayerApi = imples[embedapiVersion];
    if (!ekoPlayerApi) {
        throw new Error('');
    }
    return new ekoPlayerApi(iframe);
}

export default { create };
