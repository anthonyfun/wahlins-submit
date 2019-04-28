const Discord = require('./discord.js');
const Robot = require('./robot.js');
const db = require('./db.js');

const { Config } = require('./global.js');

const discord = new Discord();
let requestCount = 0;

discord.init(
    (message) => {
        console.log(`Recieved message: ${message.content}`);

        if (message.content === '!status') {
            (async () => {
                try {
                    const apartments = await db.getAll();

                    const message = `
### Status ###
* Discord bot status: ${discord.getStatus()}
* Total requests: ${requestCount}
* Applied count: ${apartments.length}
`;

                    discord.sendMessage(message);
                } catch (error) {
                    discord.sendMessage(`Couldn't get apartments: ${error}`);
                }
            })();
        } else if (message.content === '!list') {
            (async () => {
                try {
                    const apartments = await db.getAll();

                    const message = `
### List ###
${apartments.map(apartment => apartment.address).sort().join('\n')}
`;

                    discord.sendMessage(message);
                } catch (error) {
                    discord.sendMessage(`Couldn't get apartments: ${error}`);
                }
            })();
        }
    },
    () => {
        // main loop
        setInterval(() => {
            new Robot().run(discord);
            ++requestCount;
        }, Config.INTERVAL_IN_MS);
    }
);