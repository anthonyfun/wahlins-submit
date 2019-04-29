const puppeteer = require('puppeteer');
const { Config, Status, Wahlins } = require('./global.js');

class Robot {
    async run(discord, interval) {
        try {
            const browser = await puppeteer.launch({executablePath: 'chromium-browser'});
            const page = await browser.newPage();
            await page.goto(Config.URL);
            console.log(page.url());

            if (await this.hasNewApartments(page)) {
                console.log('Found new apartments');
                discord.sendMessage('Found new apartments');
            }
        
            await browser.close();
        } catch (error) {
            discord.sendMessage(`Error: ${error}`);
            discord.setStatus(Status.ERROR);
            clearInterval(interval);
        }
    }

    async hasNewApartments(page) {
        const texts = await page.evaluate(() => {
            const innerTexts = [];
            const elements = document.getElementsByTagName('h3');
            if (elements) {
                for (let element of elements) {
                    innerTexts.push(element.innerText);
                }
            }
            return innerTexts;
        });

        for (let text of texts) {
            if (text === Wahlins.NO_NEW_APARTMENTS) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Robot;