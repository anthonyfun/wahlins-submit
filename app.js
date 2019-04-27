const Discord = require('./discord.js');
const Robot = require('./robot.js');

const { Command, Config, isCommand } = require('./global.js');

const discord = new Discord();
let requestCount = 0;

discord.init(
    (message) => {
        console.log(message.content);
        if (isCommand(message.content, Command.STATUS)) {
            discord.sendMessage(`Status: ${discord.getStatus()}`);
        } else if (isCommand(message.content, Command.REQUEST_COUNT)) {
            discord.sendMessage(`Request count: ${requestCount}`);
        }
    },
    () => {
        setInterval(() => {
            new Robot().run(discord);
            ++requestCount;
        }, Config.INTERVAL_IN_MS);
    }
);