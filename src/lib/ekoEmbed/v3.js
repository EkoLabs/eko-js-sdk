import EkoEmbedDeliveryBase from './EkoEmbedDeliveryBase';

const INSTANCE_EMBED_API = '3.0';
const DELIVERY_SRV_INSTANCE_PATH = '/embed';

class EkoEmbedV3 extends EkoEmbedDeliveryBase {
    constructor(iframe) {
        super(INSTANCE_EMBED_API, DELIVERY_SRV_INSTANCE_PATH, iframe);
    }

    getDeliveryUrl(embedParams, options) {
        const host = options.host ? `${options.host}` : `${options.env || ''}play.eko.com`;
        return `https://${host}${this.embedpath}?${stringifyQueryParams(embedParams)}`;
    }
}

export default EkoEmbedV3;
