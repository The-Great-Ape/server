import Discord from 'discord.js';
import CommandUtil from './commands';
import { COMMAND_PREFIX } from '../config';
import Wallet from '../wallet';

import roleClaim from './role-claim';

const initHandler = async () => {
    const client = new Discord.Client();
    await CommandUtil.initCommands(client);

    client.once('ready', () => {
        console.log('Ready!');
        roleClaim(client);
    });

    client.on('message', async (message) => {
        if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) return;

        const args = message.content.slice(COMMAND_PREFIX.length).trim().split(/ +/);
        const command = args[0];

        if (!client.commands.keyArray().includes(command)) {
            return;
        }

        if (!(await Wallet.isLoggedIn(message.author.id))
      && !CommandUtil.OK_WITHOUT_LOGIN_COMMANDS.includes(command)
        ) {
            message.channel.send(
                `🚧 You must create a wallet or login before making transfers. (commands: ${CommandUtil.creationCommands.map((c) => COMMAND_PREFIX + c).join(', ')}) 🚧`
        + '\n🚧 This must be done in a private dm channel 🚧',
            );
            return;
        }

        if (message.channel.type === 'dm') {
            await client.commands.get(command).execute(message, args);
        } else if (CommandUtil.COMMANDS.SEND === command) {
            await client.commands.get(command).execute(message, args);
        }
    });

    try {
        await client.login(process.env.DISCORD_BOT_TOKEN);
    }
    catch (e) {
        console.error('Bot has failed to connect to discord.');
        process.exit(1);
    }
};

export default {
    initHandler,
};
