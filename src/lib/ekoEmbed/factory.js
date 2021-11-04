import v1 from './v1';
import v2 from './v2';
import v3 from './v3';

const imples = {
    '1.0': v1,
    '2.0': v2,
    '3.0': v3
};

function create(iframe, embedapiVersion) {
    const EkoEmbedClass = imples[embedapiVersion];
    if (!EkoEmbedClass) {
        throw new Error('Invalid Embed API version');
    }
    return new EkoEmbedClass(iframe);
}

export default { create };
