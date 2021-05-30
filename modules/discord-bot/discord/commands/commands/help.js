import Discord from 'discord.js';
import CommandUtil from '../index';
import { COMMAND_PREFIX } from '../../../config';

export default {
    name: 'help',
    description: 'Displays bot instructions.',
    usage: [`${COMMAND_PREFIX}help`],
    async execute(message) {
        const allCommands = CommandUtil.getAllCommands();
        const commandInstructions = allCommands.map((c) => ({ name: COMMAND_PREFIX + c.name, value: `${c.description}\n\nExample usage: ${c.usage.join(', ')}` }));

        const embed = new Discord.MessageEmbed();
        embed
            .setColor('#2E145D')
            .setTitle('Grapebot')
            .setDescription('Hi! I\'m Grapebot. This is my helper description!')
            .addFields(...commandInstructions)
            .setFooter('');

        message.channel.send(embed);
    },
};
