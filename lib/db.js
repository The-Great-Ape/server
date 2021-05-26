import pg from 'pg';
const { Pool, Client } = pg;

class DB {
    constructor(){
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'grape',
            password: 'elephant',
            port: 5432,
          })
    }

    async connect(){
        await this.client.connect()
    }
}

let db = new DB();
export default db;