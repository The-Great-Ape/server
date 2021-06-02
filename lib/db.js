import pg from 'pg';

const { Pool } = pg;

class DB {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        });

        this.syncTables();
    }

    async query(...args) {
        const client = await this.pool.connect();
        let response = await client.query(...args);
        client.release();
        return response && response.rows || [];
    }

    async getTables() {
        const text = `
            SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
        `;
        let response = await this.query(text);
        let tables = response && response.map(row => row.table_name);
        tables = tables.reduce((result, row) => {
            result[row] = true;
            return result;
        }, {});

        return tables;
    }

    async syncTables() {
        let tables = await this.getTables();

        if (!tables.users) {
            await this.createUserTable();
        }

        if (!tables.user_wallets) {
            await this.createUserWalletTable();
        }

        if (!tables.servers) {
            await this.createServerTable();
        }

        if (!tables.user_servers) {
            await this.createUserServerTable();
        }
    }

    //Tables
    async createServerTable() {
        const text = `
        CREATE TABLE servers (
            server_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR (512) NOT NULL,
            discord_id VARCHAR(64),
            logo VARCHAR(512)
        )`;
        let response = await this.query(text);
        console.log('Created servers table');

        return response;
    }

    async createUserServerTable() {

        const text = `
        CREATE TABLE user_servers (
            user_server_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid NOT NULL,
            server_id uuid NOT NULL
        )`;
        let response = await this.query(text);
        console.log('Created user_servers table');

        return response;
    }

    async createUserTable() {

        const text = `
        CREATE TABLE users (
            user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            discord_id VARCHAR (32),
            twitter_id VARCHAR (32),
            bot_token VARCHAR (64),
            is_og BOOLEAN,
            has_wallet BOOLEAN
        )`;
        let response = await this.query(text);
        console.log('Created users table');

        return response;
    }

    async createUserWalletTable() {

        const text = `
        CREATE TABLE user_wallets (
            user_wallet_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID,
            address VARCHAR (64) NOT NULL,
            network_id UUID,
            provider_id UUID,
            is_primary BOOLEAN
        )`;
        let response = await this.query(text);
        console.log('Created user_wallets table');

        return response;
    }
}

let db = new DB();
export default db;