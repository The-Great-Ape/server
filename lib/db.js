import pg from 'pg';

const { Pool, Client } = pg;

class DB {
    constructor() {
        this.client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        })
    }

    async connect() {
        await this.client.connect()
        await this.syncTables();
    }

    async getTables() {
        const text = `
            SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
        `;
        let response = await db.client.query(text);
        let tables = response.rows && response.rows.map(row => row.table_name);
        tables = tables.reduce((result, row) => {
            result[row] = true;
            return result;
        }, {});

        return tables;
    }

    async syncTables() {
        let tables = await this.getTables();

        if(!tables.users){
            await this.createUserTable();
        }

        if(!tables.user_wallets){
            await this.createUserWalletTable();
        }

        if(!tables.servers){
            await this.createServerTable();
        }

        if(!tables.user_servers){
            await this.createUserServerTable();
        }
    }

    //Tables
    async createServerTable(){
        const text = `
        CREATE TABLE servers (
            server_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR (512) NOT NULL,
            discord_id VARCHAR(64),
            logo VARCHAR(512)
        )`;
        let response = await this.client.query(text);

        return response;
    }

    async createUserServerTable(){
        const text = `
        CREATE TABLE user_servers (
            user_server_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid NOT NULL,
            server_id uuid NOT NULL
        )`;
        let response = await this.client.query(text);

        return response;
    }

    async createUserTable(){
        const text = `
        CREATE TABLE users (
            user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            discord_id VARCHAR (32),
            twitter_id VARCHAR (32)
        )`;
        let response = await this.client.query(text);
        return response;
    }

    async createUserWalletTable(){
        const text = `
        CREATE TABLE user_wallets (
            user_wallet_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID,
            addresss VARCHAR (64) NOT NULL,
            network_id UUID,
            provider_id UUID,
            is_primary BOOLEAN
        )`;
        let response = await this.client.query(text);
        return response;
    }
}

let db = new DB();
export default db;