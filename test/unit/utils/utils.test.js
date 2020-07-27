import utils from '../../../src/utils/utils';

describe('utils', () => {
    beforeAll(() => {
        window.AudioContext = window.AudioContext || jest.fn();
    });

    describe('buildIFrame()', () => {
        it('sets the id to the correct id', () => {
            let frame = utils.buildIFrame('ekoframe-1');
            expect(frame).not.toBe(undefined);
            expect(frame.id).toEqual('ekoframe-1');
        });
        it('sets the style of the iframe', () => {
            let frame = utils.buildIFrame('ekoframe-1');
            expect(frame).not.toBe(undefined);
            expect(frame.style.width).toEqual('100%');
            expect(frame.style.height).toEqual('100%');
            expect(frame.style.border).toEqual('0px');
            expect(frame.style.position).toEqual('absolute');
        });
    });

    describe('isEkoDomain()', () => {
        it('returns false if the eko domain is not in the origin', () => {
            expect(utils.isEkoDomain('https://google.com')).toBe(false);
        });
        it('returns true if the eko domain is in the origin', () => {
            expect(utils.isEkoDomain('https://eko.com')).toBe(true);
            expect(utils.isEkoDomain('https://video.eko.com')).toBe(true);
            expect(utils.isEkoDomain('https://video.eko.com/')).toBe(true);
        });
    });

    describe('getContainer()', () => {
        it('throws an error if no element is given', () => {
            expect(() => utils.getContainer()).toThrow('Expecting an element (or selector) as first argument.');
        });
        it('throws an error if the document cannot find the element via query selector', () => {
            expect(() => utils.getContainer('testelement'))
                .toThrow('Could not successfully resolve selector: testelement');
        });
        it('throws an error if a non element is passed in', () => {
            expect(() => utils.getContainer({params: true}))
                .toThrow('Could not resolve DOM element.');
        });
    });

    describe('pick()', () => {
        it('Returns object containing only selected keys', () => {
            expect(
                utils.pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
            ).toEqual({ a: 1, c: 3 });
        });
        it('Supports regex', () => {
            expect(
                utils.pick({
                    autoplay: true,
                    coolio: 'yay',
                    utm_id: 'coolio',
                    utm_marketing: 'thanks'
                }, ['autoplay', /^utm_.*$/])
            ).toEqual({
                autoplay: true,
                utm_id: 'coolio',
                utm_marketing: 'thanks'
            });
        });
    });

    describe('parseQueryParams()', () => {
        it('Correctly parses a query param string', () => {
            expect(
                utils.parseQueryParams('autoplay=true&coolio=yay')
            ).toEqual({
                autoplay: 'true',
                coolio: 'yay'
            });
        });
    });

    describe('stringifyQueryParams()', () => {
        it('Correctly stringifies query object', () => {
            expect(
                utils.stringifyQueryParams({
                    autoplay: true,
                    coolio: 'yay',
                    events: 'canplay,playing'
                })
            ).toEqual('autoplay=true&coolio=yay&events=canplay%2Cplaying');
        });
    });

    describe('buildEmbedUrl()', () => {
        it('Returns correct embed URL', () => {
            expect(
                utils.buildEmbedUrl(
                    'aBcDe',
                    { autoplay: 'true', events: 'canplay,playing' }
                )
            ).toEqual('https://eko.com/v/aBcDe/embed?autoplay=true&events=canplay%2Cplaying');

            expect(
                utils.buildEmbedUrl(
                    'aBcDe',
                    { autoplay: 'true', events: 'canplay,playing' },
                    'staging'
                )
            ).toEqual('https://staging.eko.com/v/aBcDe/embed?autoplay=true&events=canplay%2Cplaying');
        });
    });

    describe('uniq()', () => {
        it('Returns a unique array', () => {
            expect(
                utils.uniq([1, 2, 3, 2, 1, 'a', 'b', 'a', 'c', 'b', 'c'])
            ).toEqual([1, 2, 3, 'a', 'b', 'c']);
        });
    });

    describe('isES6Supported()', () => {
        it('Returns a boolean (true on jest test env)', () => {
            expect(utils.isES6Supported()).toBe(true);
        });
    });

    describe('isWebAudioSupported()', () => {
        it('Returns a boolean', () => {
            // Will return true on jest env, due to the beforeAll() hook
            expect(utils.isWebAudioSupported()).toBe(true);
        });
    });
});
