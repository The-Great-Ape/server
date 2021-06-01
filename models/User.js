import db from '../lib/db.js';

class User {
    constructor(data) {
        this.userId = data.user_id;
        this.discordId = data.discord_id;
        this.twitterId = data.twitter_id;
        this.botToken = data.bottoken;
        this.isOG = data.is_og;
        this.hasWallet = data.has_wallet;
    }

    static async createUser(discordId) {
        let user = discordId && await User.getByDiscordId(discordId);

        if(!user){
            const text = 'INSERT INTO users(discord_id, has_wallet) VALUES($1, false) RETURNING *';
            const values = [discordId || null];
    
            let response = await db.query(text, values);
            response = response[0];
            return new User(response);
        }
        
        return user;
    }

    static async getById(userId) {
        const text = 'SELECT * FROM users WHERE user_id = $1';
        const values = [userId];
        let response = await db.query(text, values);
        response = response[0];
        return new User(response);
    }

    static async checkDiscordId(discordId) {
        try {
            const text = 'SELECT discord_id FROM users WHERE discord_id = $1';
            const values = [discordId];
            let response = await db.query(text, values);
            response = response[0];
            if (response)
                return response.discord_id;

            return 0;
        } catch (err) {
            console.error(err);
        }
    }

    static async getByDiscordId(discordId) {
        try {
            const text = 'SELECT discord_id FROM users WHERE discord_id = $1';
            const values = [discordId];
            let response = await db.query(text, values);
            response = response[0];
            return response;
        } catch (err) {
            console.error(err);
        }
    }
    
    static async getWalletByDiscordId(discordId) {
        try {
            const text = 'SELECT a.address as address FROM user_wallets a, users b  WHERE a.user_id=b.user_id and b.discord_id = $1';
            const values = [discordId];
            let response = await db.query(text, values);
            response = response[0];
            if (response)
                return response.address;

            return 0;
        } catch (err) {
            console.error(err);
        }
    }


    async save() {
        const text = 'UPDATE users SET discord_id = $2, has_wallet=$3 WHERE user_id = $1';
        const values = [this.userId, this.discordId, this.hasWallet];
        let response = await db.query(text, values);
    }
}

export default User;
