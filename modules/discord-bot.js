import Discord from 'discord.js';
import Token from './models/token.js';

import dotenv from 'dotenv';
dotenv.config();

const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

client.on("guildMemberAdd", async member => {
    if (member.user.bot) return;

    console.log(`User ${member.id} joins guild "${member.guild.name}"`);

    const userBalance = await Token.getBalance("0x73cda88fee4b472e8f2648dda8c5868c846d0e21");
    console.log(userBalance);
});
