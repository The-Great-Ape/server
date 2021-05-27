import pg from 'pg';

const { Pool, Client } = pg;

class DB {
    constructor(){
        this.client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
          })
    }

    async connect(){
        await this.client.connect()
    }
}

let db = new DB();
export default db;