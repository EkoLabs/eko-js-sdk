import EkoEmbedDeliveryBase from './EkoEmbedDeliveryBase';

const INSTANCE_EMBED_API = '3.0';
const DELIVERY_SRV_INSTANCE_PATH = '/instance';

class EkoEmbedV3 extends EkoEmbedDeliveryBase {
    constructor(iframe) {
        super(INSTANCE_EMBED_API, DELIVERY_SRV_INSTANCE_PATH, iframe);
    }
}

export default EkoEmbedV3;
