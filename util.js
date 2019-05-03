discord = require('./discord.js');

const sendMessage = (message) => {
    console.log(message);
    discord.sendMessage(message);
};

const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj)); 
};

module.exports = {
    sendMessage,
    clone
};