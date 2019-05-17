const discord = require('./discord');
const Robot = require('./robot');
const DB = require('./db');
const Command = require('./command');
const { sendMessage } = require('./util');
const { setupCommandsForDiscord } = require('./setup');

const command = new Command();
const db = new DB();
const robot = new Robot();

const main = (db) => {
    let interval;
    interval = setInterval(
        async () => {
            try {
                await robot.run(db);
            } catch (error) {
                if (typeof error === 'string') {
                    sendMessage(error);
                } else {
                    sendMessage(`error in main, ${error.message}, ${error.stack}`);
                }
                sendMessage("stopping bot");
                clearInterval(interval);
            }
        }, 
        300000  // every 5 minutes
    );
    sendMessage('I will now look for newly added apartments at Wåhlins Fastigheter. Beep Boop.');
};

console.log(`running app in ${process.env.NODE_ENV}`);

// connect to discord server and start app
discord.init(setupCommandsForDiscord(command, robot, db, discord), () => main(db));

// start the app without discord server
//main(db);
