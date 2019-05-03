const discord = require('./discord.js');
const robot = require('./robot.js');
const db = require('./db.js');
const { sendMessage } = require('./util.js');

const INTERVAL_IN_MS = 300000; // every 5 minutes
const READY = 'I will now look for newly added apartments at Wåhlins Fastigheter. Beep Boop.';

const main = () => {
    let interval;
    try {
        interval = setInterval(
            async () => {
                await robot.run();
                ++requestCount;
            }, 
            INTERVAL_IN_MS
        );

        sendMessage(READY);
    } catch (error) {
        sendMessage('error in main');
        sendMessage(error);
        clearInterval(interval);
    }
};

const mainOnce = () => {
    (async () => {
        try {
            await robot.run();
        } catch (error) {
            console.log(error);
        }
    })();
}

const onMessage = (discordMessage) => {
    console.log(`receieved message: ${discordMessage.content}`);

    if (discordMessage.content === '!status') {
        (async () => {
            try {
                const apartments = await db.getAll();

                const message = `
### Status ###
* Discord bot status: ${discord.getStatus()}
* Total requests: ${robot.getRequestCount()}
* Applied count: ${apartments.length}
`;

                discord.sendMessage(message);
            } catch (error) {
                discord.sendMessage(`couldn't get apartments: ${error}`);
            }
        })();
    } else if (discordMessage.content === '!active') {
        (async () => {
            try {
                const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
                const apartments = (await db
                    .getAll())
                    .filter((item) => new Date(item.created) > sevenDaysAgo )

                const message = `
### List of active apartments applied (${apartments.length}) ###
${apartments.map(apartment => [apartment.address, apartment.area, apartment.rent]).sort().join('\n')}
`;

                discord.sendMessage(message);
            } catch (error) {
                discord.sendMessage(`couldn't get apartments: ${error}`);
            }
        })();
    } else if (discordMessage === '!list') {
        (async () => {
            try {
                const apartments = await db.getAll();

                const message = `
### List of all apartments applied (${apartments.length}) ###
${apartments.map(apartment => [apartment.address, apartment.area, apartment.rent]).sort().join('\n')}
`;

                discord.sendMessage(message);
            } catch (error) {
                discord.sendMessage(`couldn't get apartments: ${error}`);
            }
        })();
    }
};

// connect to discord server and start app
//discord.init(onMessage, main);

// start the app without discord server
//main();

mainOnce();