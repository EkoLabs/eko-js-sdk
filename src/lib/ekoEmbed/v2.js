import EkoEmbedDeliveryBase from './EkoEmbedDeliveryBase';

const INSTANCE_EMBED_API = '2.0';
const DELIVERY_SERVICE_BASE_URL = 'embed.eko.com';

class EkoEmbedV2 extends EkoEmbedDeliveryBase {
    constructor(iframe) {
        super(DELIVERY_SERVICE_BASE_URL, INSTANCE_EMBED_API, '/', iframe);
    }
}

export default EkoEmbedV2;
