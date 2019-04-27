const puppeteer = require('puppeteer');
const { Config } = require('./global.js');

class Robot {
    async run() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://dizz.se');
        console.log(page.url());
        console.log(await page.content());

        // await page.click('visible-inline-lg');
        // console.log(page.url());
        
        await browser.close();
    }
}

module.exports = Robot;