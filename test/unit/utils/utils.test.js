import utils from '../../../src/utils/utils';

describe('utils tests', () => {
    describe('build iframe test', () => {
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
    describe('build url', () => {
        it('adds the params to the url', () => {
            let options = {
                params: {
                    debug: true,
                    clearcheckpoints: false
                }
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options);
            expect(url.includes('debug=true')).toBe(true);
            expect(url.includes('clearcheckpoints=false')).toBe(true);
        });
        it('throws an error if embed id is missing', () => {
            expect(() => utils.buildUrl()).toThrow('Missing required param embedUrl');
        });
        it('throws an error if options are missing', () => {
            expect(() => utils.buildUrl('https://eko.com/v/AWLLK1')).toThrow('Missing required param embedOptions');
        });
        it('includes embedapi in url', () => {
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', { params: { debug: true } });
            expect(url.includes('embedapi=1.0')).toBe(true);
        });
        it('includes the eko.playing event if autoplay is true and a cover exists', () => {
            let options = {
                cover: 'someCoverElement',
                params: {
                    autoplay: true
                }
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options);
            expect(url.includes('eko.playing')).toBe(true);
        });
        it('includes the eko.canplay event if autoplay is false and a cover exists', () => {
            let options = {
                cover: 'someCoverElement',
                params: {
                    autoplay: false
                }
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options);
            expect(url.includes('eko.canplay')).toBe(true);
        });
        it('includes the sharemode=proxy if share.intent is in the event array', () => {
            let options = {
                events: ['share.intent']
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options);
            expect(url.includes('sharemode=proxy')).toBe(true);
        });
        it('includes the urlmode=proxy if urls.intent is in the event array', () => {
            let options = {
                events: ['urls.intent']
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options);
            expect(url.includes('urlmode=proxy')).toBe(true);
        });
        it('includes all specified events in the url as a comma separated list', () => {
            let options = {
                events: ['urls.intent', 'playing', 'nodestart']
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options);
            expect(url.includes('events=urls.intent,playing,nodestart')).toBe(true);
        });
        it('includes the page url params provided', () => {
            let pageUrl = 'https://abcdef.com?debug=true&myappid=abcdef';
            let pageParms = ['debug', 'myappid'];
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', {}, pageUrl, pageParms);
            expect(url.includes('debug=true')).toBe(true);
            expect(url.includes('myappid=abcdef')).toBe(true);
        });
        it('embed options has priority over page params', () => {
            let pageUrl = 'https://abcdef.com?debug=true&myappid=abcdef';
            let pageParms = ['debug', 'myappid'];
            let options = {
                params: {
                    debug: false
                }
            };
            let url = utils.buildUrl('https://eko.com/v/AWLLK1', options, pageUrl, pageParms);
            expect(url.includes('debug=false')).toBe(true);
            expect(url.includes('myappid=abcdef')).toBe(true);
        });
    });
    describe('eko domain tests', () => {
        it('returns false if the eko domain is not in the origin', () => {
            expect(utils.isEkoDomain('https://google.com')).toBe(false);
        });
        it('returns true if the eko domain is in the origin', () => {
            expect(utils.isEkoDomain('https://eko.com')).toBe(true);
            expect(utils.isEkoDomain('https://video.eko.com')).toBe(true);
        });
    });
    describe('container tests', () => {
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
    describe('query param extraction tests', () => {
        it('does not include params that are not in the approved list', () => {
            let params = utils.extractQueryParams('https://abcdef.com?debug=true&utm=someid&myappid=abc', ['debug', 'utm']);
            expect(params.debug).toBe('true');
            expect(params.utm).toBe('someid');
            expect(params.myappid).toBe(undefined);
        });
        it('returns an empty object if there are no params from the approved list', () => {
            let params = utils.extractQueryParams('https://abcdef.com?debug=true&utm=someid', ['myappid', 'test']);
            expect(params).toEqual({});
        });
        it('includes params from the approved list', () => {
            let params = utils.extractQueryParams('https://abcdef.com?debug=true&utm=someid', ['debug', 'test']);
            expect(params.debug).toEqual('true');
            expect(params.utm).toEqual(undefined);
        });
        it('handles regex as elements in the param array', () => {
            let params = utils.extractQueryParams('https://abcdef.com?debug=true&utm_marketing=someid&utm_id=anotherid', ['debug', /utm_*/]);
            expect(params.debug).toEqual('true');
            expect(params.utm_id).toEqual('anotherid');
            expect(params.utm_marketing).toEqual('someid');
        });
    });
});
