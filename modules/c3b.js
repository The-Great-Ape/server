import { Guild, User } from "discord.js";

class C3B {
    static async assignRole(guildId, userId) {
        const guild = await Guild.getById(guildId);
        const user = await User.getById(userId);

        if (!guild || !user) return;

        for (let perm of guild.permissions) {

        }
    }
}

export default C3B;
