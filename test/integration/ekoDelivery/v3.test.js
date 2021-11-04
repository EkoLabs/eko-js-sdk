/* eslint-disable no-undef */
/* eslint-disable new-cap */
/* eslint-disable no-magic-numbers */
const puppeteer = require('puppeteer');
const testingInstanceId = 'IlA4fs022o';

let browser;
beforeAll(async() => {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-features=site-per-process']
    });
}, 10000);

afterAll(async() => {
    await browser.close();
}, 15000);

jest.setTimeout(999999);
describe('ekoPlayer.load()', () => {
    it(`ekoPlayer.load(id, { autoplay: true }))
        check if autoplay set to true in query string`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: true }
            });
        }, testingInstanceId);

        // Check autoplay
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toBeDefined();
        expect(autoplayValue).toEqual('true');
    });

    it(`ekoPlayer.load(id, { autoplay: false }))
    check if autoplay set to false in query string`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: false }
            });
        }, testingInstanceId);

        // Check autoplay
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toBeDefined();
        expect(autoplayValue).toEqual('false');
    });

    it(`ekoPlayer.load(id, { iframeAttributes: {title: iframeTitle, ...}})
        check if iframeAttributes is the iframe attributes`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        // Init EkoPlayer
        const iframeId = 'testFrame';
        const iframeName = 'testName';
        const iframeTitle = 'testTitle';
        const iframeReferrerpolicy = 'no-referrer';
        await page.evaluate((id, name, title, refPollicy, instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                iframeAttributes: {
                    id: id,
                    name: name,
                    title: title,
                    referrerpolicy: refPollicy
                }
            });
        }, iframeId, iframeName, iframeTitle, iframeReferrerpolicy, testingInstanceId);

        // Check iframe attributes
        const id = await page.evaluate(() => {
            return document.querySelector('iframe').getAttribute('id');
        });
        const name = await page.evaluate(() => {
            return document.querySelector('iframe').getAttribute('name');
        });
        const title = await page.evaluate(() => {
            return document.querySelector('iframe').getAttribute('title');
        });
        const referrerpolicy = await page.evaluate(() => {
            return document.querySelector('iframe').getAttribute('referrerpolicy');
        });

        expect(id).toEqual(iframeId);
        expect(name).toEqual(iframeName);
        expect(title).toEqual(iframeTitle);
        expect(referrerpolicy).toEqual(iframeReferrerpolicy);
    });

    it(`ekoPlayer.load(id)
    check if pageParam1 & pageParam2 pass to iframe query string with correct values`, async() => {
        const page = await browser.newPage();
        const passQueryParamKeys = ['pageParam1', 'pageParam2'];
        const passQueryParamValues = ['1', '2'];
        await page.goto(`file://${__dirname}/../app.html?${passQueryParamKeys[0]}=${passQueryParamValues[0]}&${passQueryParamKeys[1]}=${passQueryParamValues[1]}`);

        // Init EkoPlayer
        // eslint-disable-next-line no-shadow
        await page.evaluate((passQueryParamKeys, instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId);
        }, passQueryParamKeys, testingInstanceId);

        // Check pageParam1
        const pageParam1ValueFromIframe = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('pageParam1');
        });

        // Check pageParam2
        const pageParam2ValueFromIframe = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('pageParam2');
        });

        expect(pageParam1ValueFromIframe).toEqual(passQueryParamValues[0]);
        expect(pageParam2ValueFromIframe).toEqual(passQueryParamValues[1]);
    });

    it(`ekoPlayer.load(id, { params: { autoplay: true } })
    check that autoplay of query param override autoplay params value as iframe queryString `, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html?autoplay=false`);

        // Init EkoPlayer
        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                params: { autoplay: true }
            });
        }, testingInstanceId);

        // Get autoplay query string value
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toEqual('false');
    });

    it(`ekoPlayer.load(id, { excludePropagatedParams: ['autoplay'] })
    check that autoplay query param is not being forwarded to iframe`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html?autoplay=false&coolio=yay`);

        // Init EkoPlayer
        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                params: { autoplay: true },
                excludePropagatedParams: ['autoplay']
            });
        }, testingInstanceId);

        // Get autoplay query string value
        const getQueryParamValue = (key) => {
            return page.evaluate((param) => {
                const iframeSrc = document.querySelector('iframe').getAttribute('src');
                const iframeURL = new URL(iframeSrc);
                return iframeURL.searchParams.get(param);
            }, key);
        };

        expect(await getQueryParamValue('autoplay')).toEqual('true');
        expect(await getQueryParamValue('coolio')).toEqual('yay');
    });

    it(`ekoPlayer.load(id, { events: ['nodestart', 'nodeend', 'playing', 'pause']})
    check that events is part of iframe query string `, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);
        const events = ['nodestart', 'nodeend', 'playing', 'pause'];

        // Init EkoPlayer
        await page.evaluate((iframeEvents, instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                events: iframeEvents
            });
        }, events, testingInstanceId);

        // Get events query string value
        const eventsValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('events');
        });

        events.forEach(event => {
            expect(eventsValue.indexOf(event)).toBeGreaterThan(-1);
        });
    });

    it(`ekoPlayer.load(id, { cover: DomCover, autoplay: false})
    check domCover autoplay false -> domCover class: eko-player-loaded`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../appWithDomCover.html`);

        // Init EkoPlayer
        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                params: { autoplay: false },
                cover: '#domCoverTest'
            });
        }, testingInstanceId);

        await page.waitForTimeout(4000);

        // Get domCover class value
        const coverClassList =  await page.evaluate(() => {
            const coverDiv = document.getElementById('domCoverTest');
            return coverDiv.classList;
        });

        expect(
            coverClassList['0'] === 'eko-player-loaded' ||
            coverClassList['0'] === 'eko-player-loading'
        ).toBeTrue();
    });

    it(`ekoPlayer.load(id, { cover: DomCover, autoplay: true})
    check domCover autoplay true -> domCover class: eko-player-started`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../appWithDomCover.html`);

        // Init EkoPlayer
        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                params: {
                    autoplay: true
                },
                cover: '#domCoverTest'
            });
        }, testingInstanceId);

        await page.waitForTimeout(8000);

        // Get domCover class value
        const coverClassList =  await page.evaluate(() => {
            const coverDiv = document.getElementById('domCoverTest');
            return coverDiv.classList;
        });

        expect(coverClassList['0']).toEqual('eko-player-started');
    });

    it(`ekoPlayer.load(id, { cover: callbackCover, autoplay: true})
    check callbackCover called for each state`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        // Init EkoPlayer
        await page.evaluate((instanceId) => {
            window.coverStatesChanged = {
                loading: false,
                loaded: false,
                started: false
            };
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                params: { autoplay: true },
                cover: function(state) {
                    window.coverStatesChanged[state] = true;
                }
            });
        }, testingInstanceId);

        await page.waitForTimeout(8000);

        // Get callbackCover states map
        const coverStatesChanged =  await page.evaluate(() => {
            return window.coverStatesChanged;
        });

        Object.values(coverStatesChanged).forEach(stateChange => {
            expect(stateChange).toBeTrue();
        });
    });

    it(`ekoPlayer.load(id, { clientSideParams: {key: 'value'}})
    check if clientSideParams is set to true in query string`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        // Init EkoPlayer
        await page.evaluate((instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                clientSideParams: { key: 'value' }
            });
        }, testingInstanceId);

        // Get csp query string value
        const cspFound = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('csp');
        });
        expect(cspFound).toBeTruthy();
    });

    it(`ekoPlayer.load(id, { clientSideParams: {key: 'value'}})
    check that clientSideParams have been set correctly in iframe`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);
        const CSP_OBJ = { key: 'value' };
        const IFRAME_ID = 'EKO_EMBED';

        // Init EkoPlayer
        await page.evaluate((CSP_OBJ, IFRAME_ID, instanceId) => { // eslint-disable-line no-shadow
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                iframeAttributes: {
                    id: IFRAME_ID
                },
                clientSideParams: CSP_OBJ
            });
        }, CSP_OBJ, IFRAME_ID, testingInstanceId);

        await page.waitForTimeout(1000);
        const projectFrame = await page.frames().find(f => f.name() === IFRAME_ID);

        // Get CSP object from iframe
        const cspObj = await projectFrame.evaluate(() => {
            return window.eko.loaderCspPromise;
        });
        expect(cspObj).toEqual(CSP_OBJ);
    });

    it(`ekoPlayer.load(id, { clientSideParams: async () => {} })
    check that async clientSideParams have been set correctly in iframe`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);
        const CSP_OBJ = { coolio: 'ya' };
        const IFRAME_ID = 'EKO_EMBED';

        // Init EkoPlayer
        await page.evaluate((CSP_OBJ, IFRAME_ID, instanceId) => { // eslint-disable-line no-shadow
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            window.cspPromise = new Promise(resolve => {
                setTimeout(() => {
                    resolve(CSP_OBJ);
                }, 1000);
            });
            ekoPlayer.load(instanceId, {
                iframeAttributes: {
                    id: IFRAME_ID
                },
                clientSideParams: () => {
                    return window.cspPromise;
                }
            });
        }, CSP_OBJ, IFRAME_ID, testingInstanceId);

        await page.waitForTimeout(1000);
        const projectFrame = await page.frames().find(f => f.name() === IFRAME_ID);

        // Get CSP object from iframe
        const cspObj = await projectFrame.evaluate(() => {
            return window.eko.loaderCspPromise;
        });
        expect(cspObj).toEqual(CSP_OBJ);
    });

    it(`ekoPlayer.load(id, { params: { id: abcde, embedapi: 3.0 } })
    check options params override default values and id args `, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html?autoplay=false`);

        const overrideId = 'abcde';
        const overrideEmbedapi = '2.1';

        // Init EkoPlayer
        await page.evaluate((id, api, instanceId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                params: {
                    id: id,
                    embedapi: api
                }
            });
        }, overrideId, overrideEmbedapi, testingInstanceId);

        // Get id query string value
        const idValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('id');
        });

        // Get embedapi string value
        const embedapiValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('embedapi');
        });

        expect(idValue).toEqual(overrideId);
        expect(embedapiValue).toEqual(overrideEmbedapi);
    });
});

describe('ekoPlayer.on()', () => {
    it(`ekoplayer.on('nodestart', callback)
        check if nodestart callback fired`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((instanceId) => {
            window.onNodeStartCallBack = false;
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');

            ekoPlayer.load(instanceId, {
                iframeAttributes: { id: 'testFrame' },
                events: ['nodestart'],
                params: { autoplay: true }
            });

            ekoPlayer.on('nodestart', () => {
                window.onNodeStartCallBack = true;
            });
        }, testingInstanceId);
        await page.waitForTimeout(8000);

        const nodeStartCallbackCalled = await page.evaluate(() => {
            return window.onNodeStartCallBack;
        });

        expect(nodeStartCallbackCalled).toBeTrue();
    });

    it(`ekoplayer.on('customTestEvent', callback)
    check if on customTestEvent callback fired & callback args are separtiated`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((instanceId) => {
            window.customEventArg1 = false;
            window.customEventArg2 = false;
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '3.0');

            ekoPlayer.load(instanceId, {
                iframeAttributes: { id: 'testFrame' },
                events: ['customTestEvent']
            });

            ekoPlayer.on('customTestEvent', (arg1, arg2) => {
                window.customEventArg1 = arg1;
                window.customEventArg2 = arg2;
            });
        }, testingInstanceId);

        await page.waitForTimeout(8000);
        let projectFrame = page.frames().find(f => f.name() === 'testFrame');
        await projectFrame.evaluate(() => {
            window.player.trigger('customTestEvent', true, true);
        });
        await page.waitForTimeout(8000);

        const customEventArg1 = await page.evaluate(() => {
            return window.customEventArg1;
        });
        const customEventArg2 = await page.evaluate(() => {
            return window.customEventArg1;
        });

        expect(customEventArg1).toBeTrue();
        expect(customEventArg2).toBeTrue();
    });
});

describe('ekoPlayer.invoke()', () => {
    it(`ekoplayer.invoke('pause')`, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((instanceId) => {
            window.ekoPlayer = new EkoPlayer('#ekoPlayerEl', '3.0');

            window.ekoPlayer.load(instanceId, {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: true }
            });
        }, testingInstanceId);
        await page.waitForTimeout(8000);

        await page.evaluate(() => {
            window.ekoPlayer.invoke('pause');
        });

        await page.waitForTimeout(1000);

        let projectFrame = page.frames().find(f => f.name() === 'testFrame');
        const isPlayerPaused = await projectFrame.evaluate(() => {
            return player.paused;
        });

        expect(isPlayerPaused).toBeTrue();
    });
});
