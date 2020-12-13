import utils from './../../../src/lib/utils';

describe('utils', () => {
    beforeAll(() => {
        window.AudioContext = window.AudioContext || jest.fn();
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
            expect(() => utils.getContainer({ params: true }))
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

    describe('setElAttributes()', () => {
        it('Returns el with attributes ', () => {
            const iframe = document.createElement('iframe');
            const attributes = {
                title: 'test',
                allowfullscreen: '',
                allow: 'autoplay *; fullscreen *'
            };
            utils.setElAttributes(iframe, attributes);
            expect(iframe.getAttribute('title')).toEqual('test');
            expect(iframe.getAttribute('allowfullscreen')).toEqual('');
            expect(iframe.getAttribute('allow')).toEqual('autoplay *; fullscreen *');
        });

        it('throw error - expect string as attribute value ', () => {
            const iframe = document.createElement('iframe');
            const attributes = { title: 1 };
            expect(() => {
                utils.setElAttributes(iframe, attributes);
            }).toThrow();
        });
    });
});
