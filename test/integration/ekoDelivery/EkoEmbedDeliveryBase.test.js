/* eslint-disable no-undef */
/* eslint-disable new-cap */
/* eslint-disable no-magic-numbers */
const puppeteer = require('puppeteer');
const testingInstanceId = '42rvvp6tpn';

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
    it(`ekoPlayer.load(id, { host: 'directembed.eko.com' }))
    check host override `, async() => {
        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/../app.html`);

        await page.evaluate((instanceId) => {
            let ekoPlayer = new EkoPlayer('#ekoPlayerEl', '3.0');
            ekoPlayer.load(instanceId, {
                iframeAttributes: { id: 'testFrame' },
                host: 'directembed.eko.com'
            });
        }, testingInstanceId);

        // Check host
        const host = await page.evaluate(() => {
            const iframeSrc = document.querySelector('iframe').getAttribute('src');
            const iframeURL = new URL(iframeSrc);
            return iframeURL.host;
        });

        expect(host).toBeDefined();
        expect(host).toEqual('directembed.eko.com');
    });
});
