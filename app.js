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
    try {
        interval = setInterval(
            async () => {
                await robot.run(db);
            }, 
            300000 // every 5 minutes
        );

        sendMessage('I will now look for newly added apartments at Wåhlins Fastigheter. Beep Boop.');
    } catch (error) {
        sendMessage('error in main');
        sendMessage(error);
        clearInterval(interval);
    }
};

console.log(`running app in ${process.env.NODE_ENV}`);

// connect to discord server and start app
discord.init(setupCommandsForDiscord(command, robot, db, discord), main);

// start the app without discord server
//main(db);
