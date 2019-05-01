const discord = require('./discord.js');
const robot = require('./robot.js');
const db = require('./db.js');
const { sendMessage } = require('./util.js');

const INTERVAL_IN_MS = 300000;
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
        sendMessage(`Error in main: ${error}`);
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
    console.log(`Receieved message: ${discordMessage.content}`);

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
                discord.sendMessage(`Couldn't get apartments: ${error}`);
            }
        })();
    } else if (discordMessage.content === '!list') {
        (async () => {
            try {
                const apartments = await db.getAll();

                const message = `
### List of apartments applied ###
${apartments.map(apartment => apartment.address).sort().join('\n')}
`;

                discord.sendMessage(message);
            } catch (error) {
                discord.sendMessage(`Couldn't get apartments: ${error}`);
            }
        })();
    }
};

// connect to discord server and start app
//discord.init(onMessage, main);
mainOnce();