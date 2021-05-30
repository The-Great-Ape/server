import fs from 'fs';
import Discord from 'discord.js';

const COMMANDS = {
    CREATE_NEW: 'create-new',
    LOGIN: 'login',
    ME: 'me',
    CLUSTER: 'cluster',
    SEND: 'send',
    LOGOUT: 'logout',
    // SAVE_DISCORDKEY: 'save-discordkey',
    // DELETE_DISCORDKEY: 'delete-discordkey',
    // GET_DISCORDKEY: 'get-discordkey',
    HELP: 'help',
    BALANCE: 'balance',
    VERIFY: 'verify',
};

const OK_WITHOUT_LOGIN_COMMANDS = [
    COMMANDS.CREATE_NEW,
    COMMANDS.LOGIN,
    //COMMANDS.SAVE_DISCORDKEY,
    //  COMMANDS.DELETE_DISCORDKEY,
    // COMMANDS.GET_DISCORDKEY,
    COMMANDS.HELP,
    COMMANDS.VERIFY,
];

let allCommands;

const initCommands = async (client) => {
    client.commands = new Discord.Collection();

    const commandFiles = fs.readdirSync(new URL('./commands', import.meta.url)).filter((file) => file.endsWith('.js'));

    const setCommand = async file => {
        const path = `./commands/${file}`;
        const command = (await import(path)).default;
        if (command) client.commands.set(command.name, command);
    };

    const promises = commandFiles.map(setCommand);

    await Promise.all(promises);
    allCommands = client.commands;
};

export default {
    initCommands,
    creationCommands: [COMMANDS.CREATE_NEW, COMMANDS.LOGIN],
    OK_WITHOUT_LOGIN_COMMANDS,
    getAllCommands: () => allCommands,
    COMMANDS,
};
