const setupCommandsForDiscord = (command, db, discord) => {
    command.set('!status', () => {
        (async () => {
            try {
                const apartments = await db.getAll();

                const message = `
    ### Status ###
    * Discord bot status: ${discord.getStatus()}
    * Total requests: ${robot.getRequestCount()}
    * Applied count: ${apartments.length}
    `;

                sendMessage(message);
            } catch (error) {
                sendMessage(`couldn't get apartments: ${error}`);
            }
        })();
    });

    command.set('!active', () => {
        (async () => {
            try {
                const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
                const apartments = (await db
                    .getAll())
                    .filter((item) => new Date(item.created) > sevenDaysAgo )

                const message = `
    ### List of active apartments applied (${apartments.length}) ###
    ${apartments.map(apartment => [apartment.address, apartment.area, apartment.rent]).sort().join('\n')}
    `;

                discord.sendMessage(message);
            } catch (error) {
                discord.sendMessage(`couldn't get apartments: ${error}`);
            }
        })();
    });

    command.set('!list', () => {
        (async () => {
            try {
                const apartments = await db.getAll();

                const message = `
    ### List of all apartments applied (${apartments.length}) ###
    ${apartments.map(apartment => [apartment.address, apartment.area, apartment.rent]).sort().join('\n')}
    `;

                discord.sendMessage(message);
            } catch (error) {
                discord.sendMessage(`couldn't get apartments: ${error}`);
            }
        })();
    });

    // return on message callback for discord message event
    return (event) => {
        if (event.content) {
            command.run(event.content);
        }
    }
};

module.exports = {
    setupCommandsForDiscord
};