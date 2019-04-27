module.exports = {
    Config: {
        URL: 'https://dizz.se',
        INTERVAL_IN_MS: 120000 // every other minute
    },
    
    // Naming this Disc instead of Discord to avoid name collisions with discord.js
    Disc: {
        CHANNEL_ID: '385206081594327042'
    },
    
    Message: {
        READY: 'I will now look for newly added apartments at Wåhlins Fastigheter. Beep Boop.',
    },
    
    Status: {
        IDLE: 'Idle',
        RUNNING: 'Running',
        ERROR: 'Error'
    },
    
    Command: {
        STATUS: 'status'
    },
    
    isCommand: (str, command) => {
        return str === `!${command}`;
    }
};