/* eslint-disable no-undef */
/* eslint-disable new-cap */
/* eslint-disable no-magic-numbers */
const puppeteer = require('puppeteer');
const testingProjectId = 'AEr3W3';

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

jest.setTimeout(120000);
describe('ekoPlayer.load()', () => {
    let page;
    beforeEach(async() => {
        page = await browser.newPage();
    });

    afterEach(() => {
        return page.close();
    });

    it(`ekoPlayer.load(id, { autoplay: true }))
        check if autoplay set to true in query string`, async() => {
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((_testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: true }
            });
        }, testingProjectId);

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
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((_testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: false }
            });
        }, testingProjectId);

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
        await page.goto(`file://${__dirname}/../app.html`);

        // Init EkoPlayer
        const iframeId = 'testFrame';
        const iframeName = 'testName';
        const iframeTitle = 'testTitle';
        const iframeReferrerpolicy = 'no-referrer';
        await page.evaluate((id, name, title, refPollicy, _testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                iframeAttributes: {
                    id: id,
                    name: name,
                    title: title,
                    referrerpolicy: refPollicy
                }
            });
        }, iframeId, iframeName, iframeTitle, iframeReferrerpolicy, testingProjectId);

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
        const passQueryParamsKeys = ['pageParam1', 'pageParam2'];
        const passQueryParamsValues = ['1', '2'];
        await page.goto(`file://${__dirname}/../app.html?${passQueryParamsKeys[0]}=${passQueryParamsValues[0]}&${passQueryParamsKeys[1]}=${passQueryParamsValues[1]}`);

        // Init EkoPlayer
        await page.evaluate((_passQueryParamsKeys, _testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId);
        }, passQueryParamsKeys, testingProjectId);

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

        expect(pageParam1ValueFromIframe).toEqual(passQueryParamsValues[0]);
        expect(pageParam2ValueFromIframe).toEqual(passQueryParamsValues[1]);
    });

    it(`ekoPlayer.load(id, { params: { autoplay: true } })
    check that autoplay query paras override autoplay params value as iframe queryString `, async() => {
        await page.goto(`file://${__dirname}/../app.html?autoplay=false`);

        // Init EkoPlayer
        await page.evaluate((_testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                params: { autoplay: true }
            });
        }, testingProjectId);

        // Get autoplay query string value
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toEqual('false');
    });

    it(`ekoPlayer.load(id, { excludePropagatedParams: ['autoplay'] })
    check that autoplay query param is not being forwarded to iframe `, async() => {
        await page.goto(`file://${__dirname}/../app.html?autoplay=false&coolio=yay`);

        // Init EkoPlayer
        await page.evaluate((_testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                params: { autoplay: true },
                excludePropagatedParams: ['autoplay']
            });
        }, testingProjectId);

        // Get autoplay query string value
        const getQueryParamValue = async (key) => {
            const retVal = await page.evaluate((param) => {
                const iframeSrc = document.querySelector('iframe').getAttribute('src');
                const iframeURL = new URL(iframeSrc);
                return iframeURL.searchParams.get(param);
            }, key);

            return retVal;
        };

        expect(await getQueryParamValue('autoplay')).toEqual('true');
        expect(await getQueryParamValue('coolio')).toEqual('yay');
    });

    it(`ekoPlayer.load(id, { events: ['nodestart', 'nodeend', 'playing', 'pause']})
    check that events is part of iframe query string `, async() => {
        await page.goto(`file://${__dirname}/../app.html`);
        const events = ['nodestart', 'nodeend', 'playing', 'pause'];

        // Init EkoPlayer
        await page.evaluate((iframeEvents, _testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                events: iframeEvents
            });
        }, events, testingProjectId);

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
        await page.goto(`file://${__dirname}/../appWithDomCover.html`);

        // Init EkoPlayer
        await page.evaluate((_testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                params: { autoplay: false },
                cover: '#domCoverTest'
            });
        }, testingProjectId);

        await page.waitForTimeout(8000);

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
        await page.goto(`file://${__dirname}/../appWithDomCover.html`);

        // Init EkoPlayer
        await page.evaluate((_testingProjectId) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                params: { autoplay: true },
                cover: '#domCoverTest'
            });
        }, testingProjectId);

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
        await page.goto(`file://${__dirname}/../app.html`);

        // Init EkoPlayer
        await page.evaluate((_testingProjectId) => {
            window.coverStatesChanged = {
                loading: false,
                loaded: false,
                started: false
            };
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load(_testingProjectId, {
                params: { autoplay: true },
                cover: function(state) {
                    window.coverStatesChanged[state] = true;
                }
            });
        }, testingProjectId);

        await page.waitForTimeout(8000);

        // Get callbackCover states map
        const coverStatesChanged =  await page.evaluate(() => {
            return window.coverStatesChanged;
        });

        Object.values(coverStatesChanged).forEach(stateChange => {
            expect(stateChange).toBeTrue();
        });
    });
});

describe('ekoPlayer.on()', () => {
    let page;
    beforeEach(async() => {
        page = await browser.newPage();
    });

    afterEach(() => {
        return page.close();
    });

    it(`ekoplayer.on('nodestart', callback) 
        check if nodestart callback fired`, async() => {
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((_testingProjectId) => {
            window.onNodeStartCallBack = false;
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');

            ekoPlayer.load(_testingProjectId, {
                iframeAttributes: { id: 'testFrame' },
                events: ['nodestart'],
                params: { autoplay: true }
            });

            ekoPlayer.on('nodestart', () => {
                window.onNodeStartCallBack = true;
            });
        }, testingProjectId);
        await page.waitForTimeout(8000);

        const nodeStartCallbackCalled = await page.evaluate(() => {
            return window.onNodeStartCallBack;
        });

        expect(nodeStartCallbackCalled).toBeTrue();
    });

    it(`ekoplayer.on('customTestEvent', callback) 
        check if on customTestEvent callback fired & callback args are separtiated`, async() => {
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((_testingProjectId) => {
            window.customEventArg1 = false;
            window.customEventArg2 = false;
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');

            ekoPlayer.load(_testingProjectId, {
                iframeAttributes: { id: 'testFrame' },
                events: ['customTestEvent']
            });

            ekoPlayer.on('customTestEvent', (arg1, arg2) => {
                window.customEventArg1 = arg1;
                window.customEventArg2 = arg2;
            });
        }, testingProjectId);

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
    let page;
    beforeEach(async() => {
        page = await browser.newPage();
    });

    afterEach(() => {
        return page.close();
    });

    it(`ekoplayer.invoke('pause')`, async() => {
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((_testingProjectId) => {
            window.ekoPlayer = new EkoPlayer('#ekoPlayerEl', '1.0');

            window.ekoPlayer.load(_testingProjectId, {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: true }
            });
        }, testingProjectId);
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
