import db from '../lib/db.js';

class Server {
    constructor(data) {
        this.serverId = data.server_id;
        this.name = data.name;
        this.discordId = data.discord_id;
        this.logo = data.logo;
    }

    static async createServer(name, discordId, logo) {
        const text = 'INSERT INTO servers(name, discord_id, logo) VALUES($1,$,$3) RETURNING *';
        const values = [name, discordId || null, logo];

        let response = await db.query(text, values);
        response = response[0];
        return new Server(response);
    }

    static async getServer(serverId) {
        const text = 'SELECT * FROM servers WHERE server_id = $1';
        const values = [serverId];
        let response = await db.query(text, values);
        response = response[0];
        return new Server(response);
    }

    static async getServers() {
        const text = 'SELECT * FROM servers';
        let response = await db.query(text);
        let servers = response.map(server => new Server(server));
        return servers;
    }
}

export default Server;
