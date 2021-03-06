require('custom-env').env(true);
const puppeteer = require('puppeteer');
const isPi = require('detect-rpi');

const { sendMessage, formatAddress } = require('./util');

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

    async run(db) {
        try {
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

            console.log(`switching url to ${process.env.TARGET_URL}`);
            try {
                await page.goto(process.env.TARGET_URL);
            } catch (error) {
                console.log(`no response from ${process.env.TARGET_URL}`);
                return;
            }

            console.log('will now look for new apartments');
            await this.applyForApartments(page, db);
        
            console.log('closing browser');
            await browser.close();
        } catch (error) {
            sendMessage(`error: ${error}`);
            throw error;
        }

        ++this.requestCount;
    }

    async applyForApartments(page, db) {
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
            try {
                await page.goto(href);
            } catch (error) {
                console.log(`no response from ${href}`);
                // wåhlins fastigheter might be down, just return
                return;
            }

            console.log('fetching information');
            const information = await this.getInformation(page);

            if (existingObjectNumbers.indexOf(information['Objektsnummer']) >= 0) {
                console.log(`already applied to ${information['Objektsnummer']}`);
                continue;
            }

            const importantNotice = information['Viktigt om visning'];
            const fillOtherField = importantNotice && importantNotice.includes('övrigtfältet');

            const address = formatAddress(information['Om'], information.header);
            await this.applyForApartment(page, fillOtherField);
            sendMessage(`applied for apartment! ${[address, information['Area'], information['Hyra']].join(', ')}`);

            if (importantNotice) {
                sendMessage(importantNotice);
            }

            try {
                const apartment = {
                    objectNumber: information['Objektsnummer'],
                    address,
                    rooms: information['Rum'],
                    area: information['Area'],
                    rent: information['Hyra'],
                    moveIn: information['Inflytt'],
                    type: information['Typ'],
                    salaryRequirement: information['Inkomstkrav'],
                    header: information.header,
                    lottery: information['Lottning'],
                    importantNotice: information['Viktigt om visning']
                };

                delete information['Om'];
                delete information['Objektsnummer'];
                delete information['Rum'];
                delete information['Area'];
                delete information['Hyra'];
                delete information['Inflytt'];
                delete information['Typ'];
                delete information['Inkomstkrav'];
                delete information['Lottning'];
                delete information['Viktigt om visning'];
                delete information.header;

                if (Object.keys(information).length > 0) {
                    apartment.other = information;
                    sendMessage(`Found other info ${JSON.stringify(apartment.other)}`);
                }

                console.log('saving apartment to db');
                await db.addApartment(apartment);
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
                            if (child) {
                                key = child.innerText;
                                information[key] = null;
                            }
                        } else if (child.classList.contains('right') && key !== '') {
                            if (child != null) {
                                information[key] = child.innerText;
                            }
                        }
                    }
                }
            }

            const purpleBgs = document.querySelectorAll('.purple-bg');
            information.header = purpleBgs[1].innerText;

            return information;
        });
    }

    async applyForApartment(page, fillOtherField) {
        await this.fillForm(page, fillOtherField);
        
        // only submit form in production because reasons
        if (process.env.NODE_ENV === 'prod') {
            await this.submitForm(page);
            await this.confirmApplication(page);
        }
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
        const selector = '.submit-green';
        await page.waitForSelector(selector);
    }

    getRequestCount() {
        return this.requestCount;
    }
}

module.exports = Robot;