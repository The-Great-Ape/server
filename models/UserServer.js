import db from '../lib/db.js';
import Server from './Server.js';

class UserServer {
    constructor(data) {
        this.userServerId = data.user_server_id;
        this.userId = data.user_id;
        this.serverId = data.server_id;
        this.name = data.name;
        this.discordId = data.discord_id;
        this.logo = data.logo;
    }

    static async createUserServer(userId, serverId) {
        let server = await Server.getById(serverId);
        let userServers = await UserServer.getByUser(userId);
        let userServer;

        userServers.forEach(item=>{
            if (item.serverId === serverId) {
                userServer = item;
            }
        });

        if (userServer) {
            return userServer;
        }

        const text = 'INSERT INTO user_servers(user_id, server_id) VALUES($1,$2) RETURNING *';
        const values = [userId, serverId];

        let response = await db.query(text, values);
        response = response[0];
        response = Object.assign({}, response, server);
        return new UserServer(response);
    }

    static async deleteUserServer(userId, serverId) {
        const text = 'DELETE FROM user_servers WHERE user_id = $1 AND server_id = $2';
        const values = [userId, serverId];
        let response = await db.query(text, values);
        return response;
    }

    static async deleteByUser(userId) {
        const text = 'DELETE FROM user_servers WHERE user_id = $1';
        const values = [userId];
        let response = await db.query(text, values);
        return response;
    }

    static async getByUser(userId) {
        const text = 'SELECT * FROM user_servers INNER JOIN servers on user_servers.server_id = servers.server_id WHERE user_id = $1';
        const values = [userId];
        let response = await db.query(text, values);

        if (response) {
            response = response.map(server => new UserServer(server));
            return response;
        }

        return [];
    }
}

export default UserServer;
