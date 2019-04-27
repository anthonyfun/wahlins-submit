const Discord = require('./discord.js');
const Robot = require('./robot.js');

const { Command, isCommand } = require('./global.js');

new Robot().run();

//const discord = new Discord();

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