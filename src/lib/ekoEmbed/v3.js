import EkoEmbedDeliveryBase from './EkoEmbedDeliveryBase';

const INSTANCE_EMBED_API = '3.0';
const DELIVERY_SERVICE_BASE_URL = 'play.eko.com';
const DELIVERY_SRV_INSTANCE_PATH = '/embed';

class EkoEmbedV3 extends EkoEmbedDeliveryBase {
    constructor(iframe) {
        super(DELIVERY_SERVICE_BASE_URL, INSTANCE_EMBED_API, DELIVERY_SRV_INSTANCE_PATH, iframe);
    }
}

export default EkoEmbedV3;
