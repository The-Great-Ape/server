import "dotenv/config.js";
import Token from '../schemas/old/token.js';
import Discord from 'discord.js';

const client = new Discord.Client();

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("guildMemberAdd", async member => {
    if (member.user.bot) return;

    console.log(`User ${member.id} joins guild "${member.guild.name}"`);

    //get user from DB etc...
    const userBalance = await Token.getBalance("0x23c84cbc8c3d786048f2ed85e3c5cee2877f2118");
    console.log(userBalance);
});
