import EkoEmbedDeliveryBase from './EkoEmbedDeliveryBase';

const INSTANCE_EMBED_API = '2.0';

class EkoEmbedV2 extends EkoEmbedDeliveryBase {
    constructor(iframe) {
        super(INSTANCE_EMBED_API, '/', iframe);
    }
}

export default EkoEmbedV2;
