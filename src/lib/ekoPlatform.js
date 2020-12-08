function isEkoDomain(domain) {
    return /https?:\/\/(.*?\.)?eko.com/.test(domain);
}

export default {
    isEkoDomain
};
