const Discord = require('discord.js');

const auth = require('./auth.json');
const { Status, Disc } = require('./global.js');

class DiscordClient {
    constructor() {
        this.client = new Discord.Client();
        this.status = Status.IDLE;
    }

    init(messageCallback, onDone) {
        this.client.on('ready', () => {
            this.status = Status.RUNNING;
            let message = 'Client connected';
            console.log(message);
            this.sendMessage(message);
            onDone();
        });
        
        this.client.on('error', (error) => {
            this.status = Status.ERROR;
            let errorMessage = `Client error ${error}`;
            console.log(errorMessage);
            this.sendMessage(errorMessage);
        });
        
        this.client.on('disconnect', () => {
            let message = 'Client disconnected';
            console.log(message);
            this.sendMessage(message);
        });
        
        this.client.on('message', messageCallback);
        this.client.login(auth.token);
    }

    // send message to Discord channel
    sendMessage(message) {
        let channel = this.client.channels.find(c => c.id === Disc.CHANNEL_ID);
        if (! channel) {
            console.log(`Couldn't find channel with id ${Disc.CHANNEL_ID}`);
            return;
        }

        channel.send(message);
    }

    setStatus(status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }
}

module.exports = DiscordClient;