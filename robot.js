const puppeteer = require('puppeteer');
const isPi = require('detect-rpi');

const { sendMessage } = require('./util.js');
const db = require('./db.js');

//const URL = 'https://wahlinfastigheter.se/lediga-objekt/lagenhet/';
const URL = 'https://dizz.se/wahlins';

const formLut = [];
formLut['Förnamn'] = process.env.FIRST_NAME;
formLut['Efternamn'] = process.env.LAST_NAME;
formLut['Gatuadress'] = process.env.STREET;
formLut['Postort'] = process.env.CITY;
formLut['Postkod'] = process.env.POSTAL_CODE;
formLut['Typ_av_boende'] = process.env.TYPE;
formLut['Personnummer'] = process.env.SOCIAL_SECURITY_NUMBER;
formLut['E-post'] = process.env.EMAIL;
formLut['Telefon'] = process.env.PHONE;
formLut['Mobil'] = process.env.PHONE;
formLut['Arbetsgivare'] = process.env.EMPLOYER;
formLut['Årsinkomst'] = process.env.SALARY;

class Robot {
    constructor() {
        this.requestCount = 0;
    }

    async run() {
        try {
            console.log('running');

            // 'chromium-browser' is needed for Raspian on raspberry pi, 
            // couldn't make it work otherwise.
            const options = isPi() 
                ? { executablePath: 'chromium-browser' }
                : {
                    headless: !(process.argv.length > 2 && process.argv[2] === 'gui'),
                    slowMo: process.argv.length > 3 ? Number(process.argv[3]) : 0
                };

            console.log('launching puppeteer');
            const browser = await puppeteer.launch(options);

            console.log('opening new page');
            const page = await browser.newPage();
            page.setDefaultTimeout(10000);

            console.log(`switching url to ${URL}`);
            await page.goto(URL);

            console.log('will now look for new apartments');
            await this.applyForApartments(page);
        
            console.log('closing browser');
            await browser.close();
        } catch (error) {
            sendMessage(`error: ${error}`);
            throw error;
        }

        ++this.requestCount;
    }

    async applyForApartments(page) {
        console.log('will now try fetch hrefs for new apartments');
        const hrefs = await page.evaluate(() => {
            let hrefs = [];
            let elements = document.querySelectorAll('.readmore');
            for (let element of elements) {
                if (element.children.length > 0  && !element.children[0].href.includes('?page')) {
                    hrefs.push(element.children[0].href);
                } 
            }

            return hrefs;
        });

        const existingObjectNumbers = (await db
            .getAllApartments())
            .map((item) => item.objectNumber);

        for (let href of hrefs) {
            console.log(`switching url to ${href}`);
            await page.goto(href);

            console.log('fetching information');
            const information = await this.getInformation(page);

            if (existingObjectNumbers.indexOf(information['Objektsnummer']) >= 0) {
                console.log(`already applied to ${information['Objektsnummer']}`);
                continue;
            }

            const importantNotice = information['Viktigt om visning'];
            const fillOtherField = importantNotice && importantNotice.includes('övrigtfältet');

            //await this.applyForApartment(page, fillOtherField);
            sendMessage(`applied for apartment! ${[information['Om'], information['Area'], information['Hyra']].join(', ')}`);

            if (importantNotice) {
                sendMessage(importantNotice);
            }

            try {
                console.log('saving apartment to db');
                await db.addApartment({
                    href,
                    objectNumber: information['Objektsnummer'],
                    address: information['Om'],
                    rooms: information['Rum'],
                    area: information['Area'],
                    rent: information['Hyra'],
                    moveIn: information['Inflytt'],
                    type: information['Typ'],
                    salaryRequirement: information['Inkomstkrav'],
                    lottery: information['Lottning'],
                    importantNotice: information['Viktigt om visning']
                });
            } catch (error) {
                sendMessage(`couldn't save apartment to db: ${error}`);
            }
        }
    }

    async getInformation(page) {
        return await page.evaluate(() => {
            let parents = [];
            let uls = document.getElementsByTagName('ul');
            for (let ul of uls) {
                if (ul.classList.contains('leftRight-ul')) {
                    parents.push(ul);
                }
            }

            const information = {};
            for (parent of parents) {
                if (parent.children.length > 0) {
                    let key = '';
                    for (child of parent.children) {
                        if (child.classList.contains('left')) {
                            key = child.innerText;
                        } else if (child.classList.contains('right') && key !== '') {
                            information[key] = child.innerText;
                        }
                    }
                }
            }

            return information;
        });
    }

    async applyForApartment(page, fillOtherField) {
        await this.fillForm(page, fillOtherField);
        await this.submitForm(page);
        await this.confirmApplication(page);
    }

    async fillForm(page, fillOtherField) {
        const keys = Object.keys(formLut);
        console.log(`waiting and typing for all fields`);
        for (let key of keys) {
            await page.waitFor(`#${key}`);
            await page.type(`#${key}`, formLut[key]);
        }

        if (fillOtherField) {
            // special case, the apartment viewing is today so we gotta let them know in the
            // 'other' field that we understand it. 
            const otherId = '#message';

            await page.waitFor(otherId);
            await page.type(otherId, 'Jag har tagit del av den viktiga informationen!');
        }

        await page.select('#Hushållet_personer', '1');
        await page.click('#gdpr_checkbox');
    }

    async submitForm(page) {
        console.log("will now click submit button");
        await page.evaluate(() => {
            let input = document.querySelector('input[name="Submit"]');
            input.click();
        });
    }

    async confirmApplication(page) {
        const selector = 'submit-green';
        await page.waitForSelector(selector);
    }

    getRequestCount() {
        return this.requestCount;
    }
}

const robot = new Robot();
module.exports = robot;