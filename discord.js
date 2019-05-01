require('dotenv').config();
const Discord = require('discord.js');

const CHANNEL_ID = '385206081594327042';
const Status = {
    NOT_CONNECTED: 'Not connected',
    RUNNING: 'Running',
    ERROR: 'Error'
};

class DiscordClient {
    constructor() {
        this.client = new Discord.Client();
        this.status = Status.NOT_CONNECTED;
    }

    // login and connect to discord server
    init(onMessage, onReady) {
        this.client.on('ready', () => {
            this.status = Status.RUNNING;
            const message = 'Client connected';
            console.log(message);
            this.sendMessage(message);
            onReady();
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
        
        this.client.on('message', onMessage);
        this.client.login(process.env.DISCORD_BOT_TOKEN);
    }

    // send message to Discord channel
    sendMessage(message) {
        if (this.status === Status.NOT_CONNECTED) {
            return;
        }

        const channel = this.client.channels.find(c => c.id === Disc.CHANNEL_ID);
        if (! channel) {
            console.log(`Couldn't find channel with id ${CHANNEL_ID}`);
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

const discordClient = new DiscordClient();
module.exports = discordClient;