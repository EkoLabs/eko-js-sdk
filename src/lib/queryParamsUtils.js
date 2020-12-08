function parseQueryParams(queryStr) {
    let retVal = {};
    let searchParams = new URLSearchParams(queryStr);

    searchParams.forEach((value, key) => {
        retVal[key] = value;
    });

    return retVal;
}

function stringifyQueryParams(queryObj) {
    let searchParams = new URLSearchParams();

    Object.keys(queryObj).forEach((key) => {
        searchParams.set(key, queryObj[key]);
    });

    return searchParams.toString();
}

export {
    parseQueryParams,
    stringifyQueryParams
};
