discord = require('./discord.js');

const sendMessage = (message) => {
    console.log(message);
    discord.sendMessage(message);
};

module.exports = {
    sendMessage
};