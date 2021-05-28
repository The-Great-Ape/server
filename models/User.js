import db from '../lib/db.js';

class User {
    constructor(data){   
        this.userId = data.user_id;
        this.discordId = data.discord_id;
        this.twitterId = data.twitter_id;
        this.botToken = data.bottoken;

    }

    static async createTable(){
        const text = `
        CREATE TABLE users (
            user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            discord_id VARCHAR (32),
            twitter_id VARCHAR (32),
        `;
        let response = await db.client.query(text);
        return response;
    }

    static async createUser(discordId){
        const text = 'INSERT INTO users(discord_id) VALUES($1) RETURNING *';
        const values = [discordId || null];
        
        let response = await db.client.query(text, values);
        response = response.rows && response.rows[0];
        return new User(response);
    }

    static async getById(userId){
        const text = 'SELECT * FROM users WHERE user_id = $1';
        const values = [userId];
        let response = await db.client.query(text, values);
        response = response.rows && response.rows[0];
        return new User(response);
    }

    async save(){
        const text = 'UPDATE users SET discord_id = $2 WHERE user_id = $1';
        const values = [this.userId, this.discordId];
        let response = await db.client.query(text,values);
    }
}

export default User;
