import EkoPlayer from '../../src/EkoPlayer';
import utils from '../../src/utils/utils';

describe('EkoPlayer', () => {
    beforeAll(() => {
        window.AudioContext = window.AudioContext || jest.fn();
    });

    describe('constructor', () => {
        it('throws an error if no element is passed in', () => {
            expect(() => new EkoPlayer()).toThrow('Constructor must get an element (or selector) as first argument.');
        });
        it('throws an error if element doesnt exist', () => {
            expect(() => new EkoPlayer('hello')).toThrow('Could not successfully resolve selector: hello');
        });
        it('has these expected functions', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let ekoplayer = new EkoPlayer('testelement');
            expect(typeof ekoplayer.load).toBe('function');
            expect(typeof ekoplayer.play).toBe('function');
            expect(typeof ekoplayer.pause).toBe('function');
            expect(typeof ekoplayer.invoke).toBe('function');
            expect(typeof EkoPlayer.isSupported).toBe('function');
        });
    });
    describe('load()', () => {
        it('throws an error if the frame title is not a string', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let ekoplayer = new EkoPlayer('testelement');
            expect(() => {
                ekoplayer.load('AWLLK1', {
                    iframeAttributes: { title: 12343 }
                });
            }).toThrow('Received type number. Expected string.');
        });
        it('sets the iframe title if it can', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let iframe = document.createElement('iframe');
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.load('AWLLK1', { iframeAttributes: { title: 'eko player title' } });
            expect(iframe.title).toBe('eko player title');
        });
        it('sets the iframe source to the correct project id', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let iframe = document.createElement('iframe');
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.load('AWLLK1');
            expect(iframe.src.includes('https://eko.com/v/AWLLK1')).toBe(true);
        });
        it('supports function as the "cover" option', (done) => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            jest.spyOn(utils, 'isEkoDomain').mockReturnValue(true);
            const coverCallback = jest.fn();
            let iframe = document.createElement('iframe');
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.load('AWLLK1', { cover: coverCallback });
            expect(coverCallback).toHaveBeenLastCalledWith('loading');

            ekoplayer.once('canplay', () => {
                expect(coverCallback).toHaveBeenLastCalledWith('loaded', { buffered: 2, isAutoplayExpected: true });
            });
            ekoplayer.once('playing', () => {
                expect(coverCallback).toHaveBeenLastCalledWith('started');
                done();
            });

            window.postMessage({
                type: 'eko.canplay',
                args: [2, true],
                embedId: iframe.id
            }, '*');
            window.postMessage({
                type: 'eko.playing',
                embedId: iframe.id
            }, '*');
        });
        it('sets the iframe source to use Delivery serivce', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let iframe = document.createElement('iframe');
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.load('AWLLK1', { useDeliveryService: true });
            expect(iframe.src.includes('https://embed.eko.com/?id=AWLLK1')).toBe(true);
            expect(iframe.src.includes('&embedapi=2.0')).toBe(true);
        });
    });

    describe('invoke()', () => {
        it('throws an error when the method is not a string', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let ekoplayer = new EkoPlayer('testelement');
            expect(() => ekoplayer.invoke(100)).toThrow('Expected required argument method to have type string');
        });
        it('includes the method when calling invoke', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let mockfn = jest.fn();
            let iframe = {
                contentWindow: {
                    postMessage: mockfn
                }
            };
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.invoke('play');
            expect(mockfn.mock.calls[0][0].type).toBe('eko.play');
        });
        it('includes the args when calling invoke', () => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            let mockfn = jest.fn();
            let iframe = {
                contentWindow: {
                    postMessage: mockfn
                }
            };
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.invoke('seek', 'myNodeId', 10);
            expect(mockfn.mock.calls[0][0].type).toBe('eko.seek');
            expect(Array.isArray(mockfn.mock.calls[0][0].args)).toBe(true);
            expect(mockfn.mock.calls[0][0].args[0]).toBe('myNodeId');
            expect(mockfn.mock.calls[0][0].args[1]).toBe(10);
        });
    });
    describe('Event forwarding', () => {
        it('event gets forwarded on "on"', (done) => {
            jest.spyOn(utils, 'getContainer').mockReturnValue({ appendChild: () => {} });
            jest.spyOn(utils, 'isEkoDomain').mockReturnValue(true);
            let iframe = document.createElement('iframe');
            jest.spyOn(utils, 'buildIFrame').mockReturnValue(iframe);
            let ekoplayer = new EkoPlayer('testelement');
            ekoplayer.on('canplay', done);
            window.postMessage({
                type: 'eko.canplay',
                embedId: iframe.id
            }, '*');
        });
    });
});
