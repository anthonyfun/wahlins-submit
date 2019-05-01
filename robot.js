const puppeteer = require('puppeteer');
const { sendMessage } = require('./util.js');
const db = require('./db.js');

//const URL = 'https://wahlinfastigheter.se/lediga-objekt/lagenhet/';
const URL = 'https://dizz.se/wahlins';

const INFO_LABELS = [
    'Objektsnummer',
    'Om',
    'Rum',
    'Area',
    'Hyra',
    'Inflytt',
    'Typ',
    'Inkomstkrav',
    'Viktigt om visning',
    'Lottning',
];

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
const SUBMIT_BUTTON_NAME = 'Submit';
const OTHER_FIELD_SPECIAL_CASE = 'Jag förstår att visningen är idag!';
const APARTMENT_LIST_CLASS = 'fastighet';
const CONFIRM_P_CLASS = 'submit-green';
const CONFIRM_TEXT = 'Tack!';
const NO_NEW_APARTMENTS = 'Just nu har vi tyvärr inga lediga lägenheter att förmedla här.';

class Robot {
    constructor() {
        this.requestCount = 0;
    }

    async run() {
        try {
            console.log("running");
            // 'chromium-browser' is needed for Raspian on raspberry pi. You can probably
            // omit the launch options if using a different platform. 
            //const browser = await puppeteer.launch({executablePath: 'chromium-browser'});
            const browser = await puppeteer.launch({ 
                headless: !(process.argv.length > 2 && process.argv[2] === 'gui'),
                slowMo: process.argv.length > 3 ? Number(process.argv[3]) : 0
            });
            console.log("launched");
            const page = await browser.newPage();
            console.log("opened new page");

            await page.goto(URL);
            console.log(page.url());

            if (await this.hasNewApartments(page)) {
                sendMessage('Found new apartments');

                await this.applyForApartments(page);
            }
        
            await browser.close();
        } catch (error) {
            sendMessage(`Error: ${error}`);
            throw error;
        }

        ++this.requestCount;
    }

    async applyForApartments(page) {
        const appliedApartments = await db.getAllApartments();

        page.on('console', (message) => {
            console.log(message._text);
        });

        console.log("evaluating");
        const hrefs = await page.evaluate((className) => {
            let hrefs = [];
            let elements = document.querySelectorAll(`.${className}`);
            for (let element of elements) {
                if (element.children.length > 0 
                    && !element.children[0].href.includes('?page')
                ) {
                    hrefs.push(element.children[0].href);
                    console.log(element.children[0].href);
                } else {
                    console.log("invalid href");
                }
            }

            return hrefs;
        }, 'readmore');
        console.log("done");
        console.log(hrefs);

        for (let href of hrefs) {
            await page.goto(href);
            console.log(page.url());

            const information = await this.getInformation(page);
            console.log(information);

            if (appliedApartments.map((item) => item.objectNumber).indexOf(information['Objektsnummer']) < 0) {
                if (await this.applyForApartment(page)) {
                    sendMessage("Applied for apartment!");
                    // save information to db
                    try {
                        console.log("will add apartment to db");
                        //await db.add(information);
                    } catch (error) {
                        const message = `Couldn't save the applied apartment to the DB: ${error}`;
                        sendMessage(message);
                        console.log(message);
                        sendMessage(JSON.stringify(information));
                        console.log(JSON.stringify(information));
                    }
                } else {
                    sendMessage("Couldn't apply for application, quitting");
                    sendMessage(JSON.stringify(information));
                    console.log(JSON.stringify(informatin));
                    console.log("Couldn't apply for application, quitting");
                    throw 'Error: Couldn\'t send application';
                }
            } else {
                console.log(`already applied to ${information['Objektsnummer']}`);
            }

            await page.waitFor(20000);
        }
    }

    async applyForApartment(page) {
        await this.fillForm(page);
        //await this.submitForm(page);
        //return await this.confirmApplication(page);
        return true;
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
        await page.click(SUBMIT_BUTTON_NAME);
    }

    async confirmApplication() {
        return await page.evaluate(() => {
            const elements = document.querySelector(`.${CONFIRM_P_CLASS}`)
            for (let element of elements) {
                if (element.innerTextl.contains(CONFIRM_TEXT)) {
                    return true;
                }
            }
            return false;
        });
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
            if (text === NO_NEW_APARTMENTS) {
                return false;
            }
        }
        return true;
    }

    getRequestCount() {
        return this.requestCount;
    }
}

const robot = new Robot();
module.exports = robot;