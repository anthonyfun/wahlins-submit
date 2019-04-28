const Discord = require('discord.js');

const { Status, Disc } = require('./global.js');

class DiscordClient {
    constructor() {
        this.client = new Discord.Client();
        this.status = Status.IDLE;
    }

    init(messageCallback, onDone) {
        this.client.on('ready', () => {
            this.status = Status.RUNNING;
            const message = 'Client connected';
            console.log(message);
            this.sendMessage(message);
            onDone();
        });
        
        this.client.on('error', (error) => {
            this.status = Status.ERROR;
            const errorMessage = `Client error ${error}`;
            console.log(errorMessage);
            this.sendMessage(errorMessage);
        });
        
        this.client.on('disconnect', () => {
            const message = 'Client disconnected';
            console.log(message);
            this.sendMessage(message);
        });
        
        this.client.on('message', messageCallback);
        this.client.login('');
    }

    // send message to Discord channel
    sendMessage(message) {
        const channel = this.client.channels.find(c => c.id === Disc.CHANNEL_ID);
        if (! channel) {
            console.log(`Couldn't find channel with id ${Disc.CHANNEL_ID}`);
            return;
        }

        console.log(`sending message to discord: ${message}`);
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