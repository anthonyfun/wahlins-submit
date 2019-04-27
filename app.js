const Discord = require('./discord.js');
const Robot = require('./robot.js');

const { Command, isCommand } = require('./global.js');

const discord = new Discord();

new Robot().run(discord);

// discord.init(
//     (message) => {
//         console.log(message.content);
//         if (isCommand(message.content, Command.STATUS)) {
//             discord.sendMessage(`My status is: ${discord.getStatus()}`);
//         }
//     },
//     () => {
//         new Robot().run();
//     }
// );