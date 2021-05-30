import User from '../../../models/User';
import firstMessage from './first-message';

export default (client) => {
    const channelId = '848506777049235476';

    const getEmoji = (emojiName) => client.emojis.cache.find((emoji) => emoji.name === emojiName);

    const emojis = {
        medianetwork: 'MEDIA Holder',
        walletv2: 'Verified Wallet',
    };

    const reactions = [];

    let emojiText = 'Gated SPL token community access!\n\n';
    for (const key in emojis) {
        const emoji = getEmoji(key);
        reactions.push(emoji);

        const role = emojis[key];
        emojiText += `${emoji} = ${role}\n`;
    }

    firstMessage(client, channelId, emojiText, reactions);

    const handleReaction = async (reaction, user, add) => {
        if (user.id === process.env.DISCORD_BOT_ID) {
            return;
        }

        const emoji = reaction._emoji.name;

        const { guild } = reaction.message;

        const roleName = emojis[emoji];
        if (!roleName) {
            return;
        }

        const role = guild.roles.cache.find((role) => role.name === roleName);
        const member = guild.members.cache.find((member) => member.id === user.id);

        if (add) {
            const discordId = member.id;
            const dbDiscordId = await User.getByDiscordId(discordId);
            member.roles.add(role);
        }
    // else {
    //   member.roles.remove(role);
    // }
    };

    client.on('messageReactionAdd', async (reaction, user) => {
        if (reaction.message.channel.id === channelId) {
            await handleReaction(reaction, user, true);
        }
    });

    client.on('guildMemberAdd', async member => {
        if (member.user.bot) return;

        //member.roles.add(member.guild.roles.cache.find((role) => role.name === 'MEDIA Holder'));
    });

    // client.on('messageReactionRemove', (reaction, user) => {
    //   if (reaction.message.channel.id === channelId) {
    //     handleReaction(reaction, user, false);
    //   }
    // });
};
