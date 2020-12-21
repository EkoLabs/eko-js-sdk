let instanceCount = 0;

function create() {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', `ekoembed-${++instanceCount}`);
    return iframe;
}

export default { create };
