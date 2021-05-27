import db from '../lib/db.js';

class UserServer {
    constructor(data){   
        this.userServerId = data.user_server_id;
        this.userId = data.user_id;
        this.serverId = data.server_id;
    }

    static async createrUserServer(userId, serverId){
        const text = 'INSERT INTO user_servers(user_id, server_id) VALUES($1,$2) RETURNING *';
        const values = [userId, serverId];
        
        let response = await db.client.query(text, values);
        response = response.rows && response.rows[0];
        return new UserServer(response);
    }

    static async deleteUserServer(userId, serverId){
        const text = 'DELETE FROM user_servers WHERE user_id = $1 AND server_id = $2';
        const values = [userId, serverId];
        let response = await db.client.query(text, values);
        return response;
    }

    static async getUserServers(userId){
        const text = 'SELECT * user_servers WHERE user_id = $1';
        const values = [userId];
        let response = await db.client.query(text, values);
        return response;
    }
}

export default UserServer;
