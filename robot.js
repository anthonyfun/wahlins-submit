const puppeteer = require('puppeteer');
const isPi = require('detect-rpi');

const { sendMessage } = require('./util.js');
const db = require('./db.js');

//const URL = 'https://wahlinfastigheter.se/lediga-objekt/lagenhet/';
const URL = 'https://dizz.se/wahlins';

const INPUT_IDS = [
    'Förnamn',
    'Efternamn',
    'Gatuadress',
    'Postort',
    'Postkod',
    'Typ_av_boende',
    'Personnummer',
    'E-post',
    'Telefon',
    'Mobil',
    'Arbetsgivare',
    'Årsinkomst',
];

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

const CONTACT_LABEL = 'Kontaktperson';
const SELECT_TOTAL_RESIDENTS_ID = 'Hushållet_personer';
const TEXTAREA_OTHER_NAME = 'message';
const CHECKBOX_GDPR_ID = 'gdpr_checkbox';
const OTHER_FIELD_SPECIAL_CASE = 'Jag förstår att visningen är idag!';
const NO_NEW_APARTMENTS = 'Just nu har vi tyvärr inga lediga lägenheter att förmedla här.';

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

            console.log(`switching url to ${URL}`);
            await page.goto(URL);

            console.log('will now look for new apartments');
            await this.applyForApartments(page);
        
            console.log('closing browser');
            await browser.close();
        } catch (error) {
            sendMessage(`Error: ${error}`);
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

        const existingObjectNumbers = await db
            .getAllApartments()
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

            if (await this.applyForApartment(page)) {
                sendMessage(`applied for apartment! 
                    ${[information['Om'], information['Area'], information['Hyra']].join(', ')}`
                );

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
                    sendMessage(`Couldn't save apartment to db: ${error}`);
                }
            } else {
                sendMessage(`Couldn't apply for apartment ${information}`);
                throw 'Error, couldn\'t apply for apartment';
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

    async applyForApartment(page) {
        await this.fillForm(page);
        await this.submitForm(page);
        await page.waitFor(10000);
        return await this.confirmApplication(page);
    }

    async getContact(page) {
        return await page.evaluate(() => {
            const elements = document.getElementsByTagName('h3');
            for (let element of elements) {
                if (element.innerText === CONTACT_LABEL) {
                    if (element.parentElement) {
                        const contact = element.parentElement.innerText.replace(/"(.*?)"/g);
                        console.log(contact);
                        return contact;
                    }
                }
            }

            console.log('didn\'t find contact');
            return '';
        });
    }

    async fillForm(page, fillOtherField) {
        console.log("filling form");
        for (let i = 0; i < INPUT_IDS.length; ++i) {
            const id = INPUT_IDS[i];
            console.log(`waiting and typing for #${id}`)
            await page.waitFor(`#${id}`);
            await page.type(`#${id}`, formLut[id]);
        }

        if (fillOtherField) {
            // special case, the apartment viewing is today so we gotta let them know in the
            // 'other' field that we understand it. 
            await page.waitFor(`#${TEXTAREA_OTHER_NAME}`);
            await page.type(`#${TEXTAREA_OTHER_NAME}`, OTHER_FIELD_SPECIAL_CASE);
        }

        await page.select(`#${SELECT_TOTAL_RESIDENTS_ID}`, '1');
        await page.click(`#${CHECKBOX_GDPR_ID}`);
    }

    async submitForm(page) {
        return await page.evaluate(() => {
            let input = document.querySelector('input[name="Submit"]');
            if (input) {
                input.click();
                return true;
            }
            return false;
        });
    }

    async confirmApplication(page) {
        await page.waitForSelector('.submit-green');
        console.log(page.url());
        let temp = await page.evaluate(() => {
            const element = document.querySelector('.submit-green');
            return element && element.innerText.includes('Tack!');
        });
        page.waitFor(10000);
        return temp;
    }

    getRequestCount() {
        return this.requestCount;
    }
}

const robot = new Robot();
module.exports = robot;