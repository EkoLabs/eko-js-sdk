import ekoPlatform from './../../../src/lib/ekoPlatform';

describe('isEkoDomain()', () => {
    it('returns false if the eko domain is not in the origin', () => {
        expect(ekoPlatform.isEkoDomain('https://google.com')).toBe(false);
    });
    it('returns true if the eko domain is in the origin', () => {
        expect(ekoPlatform.isEkoDomain('https://eko.com')).toBe(true);
        expect(ekoPlatform.isEkoDomain('https://video.eko.com')).toBe(true);
        expect(ekoPlatform.isEkoDomain('https://video.eko.com/')).toBe(true);
    });
});
