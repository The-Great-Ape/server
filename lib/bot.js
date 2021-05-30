import 'dotenv/config.js';
import Token from '../schemas/old/token.js';
import Discord from 'discord.js';

const client = new Discord.Client();

console.log('bot logging in...');
client.login(process.env.DISCORD_BOT_TOKEN);
console.log('bot logged in... listening to events.');

client.on('guildMemberAdd', async member => {
    if (member.user.bot) return;

    console.log(`User ${member.id} joins guild "${member.guild.name}"`);

    /*
    get user from DB
    if user doesn't exists, send him DM or @him on channel to send link to register wallet
    if user exists:
      check server tokens/roles
      get user balance for these tokens
      assign role to user if it meets any requirement
    */
    const userBalance = await Token.getBalance('0x23c84cbc8c3d786048f2ed85e3c5cee2877f2118');
    console.log(userBalance);
});

client.on('guildMemberAvailable', member => {
    console.log(`member becomes available in a large guild: ${member.tag}`);
});
