/* eslint-disable no-undef */

/* eslint-disable new-cap */
/* eslint-disable no-magic-numbers */
const puppeteer = require('puppeteer');


jest.setTimeout(999999);
describe('embedapi version 1.0 load tests', () => {
    it(`ekoPlayer.load(projectId, { autoplay: true }))
        check if autoplay set to true in query string`, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html`);

        await page.evaluate(() => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: true }
            });
        });

        // Check autoplay
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toBeDefined();
        expect(autoplayValue).toEqual('true');

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { autoplay: false }))
    check if autoplay set to false in query string`, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html`);

        await page.evaluate(() => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                iframeAttributes: { id: 'testFrame' },
                params: { autoplay: false }
            });
        });

        // Check autoplay
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toBeDefined();
        expect(autoplayValue).toEqual('false');

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { iframeAttributes: {title: iframeTitle, ...}})
        check if iframeAttributes is the iframe attributes`, async() => {
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html`);

        // Init EkoPlayer
        const iframeId = 'testFrame';
        const iframeName = 'testName';
        const iframeTitle = 'testTitle';
        const iframeReferrerpolicy = 'no-referrer';
        await page.evaluate((id, name, title, refPollicy) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                iframeAttributes: {
                    id: id,
                    name: name,
                    title: title,
                    referrerpolicy: refPollicy
                }
            });
        }, iframeId, iframeName, iframeTitle, iframeReferrerpolicy);

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

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { pageParams: [pageParam1, ...]})
    check if pageParam1 & pageParam2 pass to iframe query string with correct values`, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        const passPageParamsKeys = ['pageParam1', 'pageParam2'];
        const passPageParamsValues = ['1', '2'];
        await page.goto(`file://${__dirname}/app.html?${passPageParamsKeys[0]}=${passPageParamsValues[0]}&${passPageParamsKeys[1]}=${passPageParamsValues[1]}`);

        // Init EkoPlayer

        await page.evaluate((pageParams) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                pageParams
            });
        }, passPageParamsKeys);

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

        expect(pageParam1ValueFromIframe).toEqual(passPageParamsValues[0]);
        expect(pageParam2ValueFromIframe).toEqual(passPageParamsValues[1]);

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { params: {autoplay: true}, pageParams: [autoplay]})
    check that autoplay of page params override autoplay params value as iframe queryString `, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html?autoplay=false`);

        // Init EkoPlayer
        await page.evaluate(() => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                params: { autoplay: true },
                pageParams: ['autoplay']
            });
        });

        // Check autoplay
        const autoplayValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('autoplay');
        });

        expect(autoplayValue).toEqual('false');

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { events: ['nodestart', 'nodeend', 'playing', 'pause']})
    check that events is part of iframe query string `, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html`);
        const events = ['nodestart', 'nodeend', 'playing', 'pause'];

        // Init EkoPlayer
        await page.evaluate((iframeEvents) => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                events: iframeEvents
            });
        }, events);

        // Check events
        const eventsValue = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.searchParams.get('events');
        });

        events.forEach(event => {
            expect(eventsValue.indexOf(event)).toBeGreaterThan(-1);
        });

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { cover: DomCover, autoplay: false})
    check domCover autoplay false -> domCover class: eko-player-loaded`, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/appWithDomCover.html`);

        // Init EkoPlayer
        await page.evaluate(() => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                params: { autoplay: false },
                cover: '#domCoverTest'
            });
        });

        await page.waitForTimeout(2000);

        // Check dom cover class
        const coverClassList =  await page.evaluate(() => {
            const coverDiv = document.getElementById('domCoverTest');
            return coverDiv.classList;
        });

        expect(coverClassList['0']).toEqual('eko-player-loaded');

        await browser.close();
    });

    it(`ekoPlayer.load(projectId, { cover: DomCover, autoplay: true})
    check domCover autoplay true -> domCover class: eko-player-started`, async() => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/appWithDomCover.html`);

        // Init EkoPlayer
        await page.evaluate(() => {
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                params: { autoplay: true },
                cover: '#domCoverTest'
            });
        });

        await page.waitForTimeout(2000);

        // Check dom cover class
        const coverClassList =  await page.evaluate(() => {
            const coverDiv = document.getElementById('domCoverTest');
            return coverDiv.classList;
        });

        expect(coverClassList['0']).toEqual('eko-player-started');

        await browser.close();
    });
});

describe.only('ekoPlayer.on()', () => {
    it(`ekoPlayer.load(projectId, { events: [nodestart] })
        check if on nodestart call back is fired`, async() => {
        const browser = await puppeteer.launch({
            headless: false,
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html`);

        await page.evaluate(() => {
            window.onNodeStartCallBack = false;
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '1.0');
            ekoPlayer.load('zmb330', {
                iframeAttributes: { id: 'testFrame' },
                events: ['nodestart']
            });
            ekoPlayer.on('nodestart', () => {
                window.onNodeStartCallBack = true;
            });
        });
        await page.waitForTimeout(3000);

        const nodeStartCallbackCalled = await page.evaluate(() => {
            return window.onNodeStartCallBack;
        });
        expect(nodeStartCallbackCalled).toBeTrue();

        await browser.close();
    });
    it.only(`ekoPlayer.load(projectId, { events: [nodestart] })
        check if on nodestart call back is fired`, async() => {
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--disable-features=site-per-process']
        });
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/app.html`);

        await page.evaluate(() => {
            window.customTestEventFired = false;
            let ekoPlayer =  new EkoPlayer('#ekoPlayerEl', '2.0');
            ekoPlayer.load('zmb330', {
                iframeAttributes: { id: 'testFrame' },
                events: ['customTestEvent']
            });
            ekoPlayer.on('customTestEvent', () => {
                window.customTestEventFired = true;
            });
        });
        await page.waitForTimeout(2000);
        let projectFrame = page.frames().find(f => f.name() === 'testFrame');
        await projectFrame.evaluate(() => {
            window.player.trigger('customTestEvent');
        });
        await page.waitForTimeout(2000);
        const customTestEventFired = await page.evaluate(() => {
            return window.customTestEventFired;
        });
        expect(customTestEventFired).toBeTrue();
        await browser.close();
    });
});
