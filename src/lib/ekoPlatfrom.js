function isEkoDomain(domain) {
    return /https?:\/\/(.*?\.)?eko.com/.test(domain);
}

function stringifyQueryParams(queryObj) {
    let searchParams = new URLSearchParams();

    Object.keys(queryObj).forEach((key) => {
        searchParams.set(key, queryObj[key]);
    });

    return searchParams.toString();
}

function buildBalooUrl(projectId, embedParamsObj, env) {
    return `https://${env ? (env + '.') : ''}eko.com/v/${projectId}/embed?${stringifyQueryParams(embedParamsObj)}`;
}

function buildDeliveryUrl(embedParamsObj, env) {
    return `https://${env || ''}embed.eko.com/${stringifyQueryParams(embedParamsObj)}`;
}

export default {
    isEkoDomain,
    buildBalooUrl,
    buildDeliveryUrl
};
