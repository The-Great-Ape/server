import db from '../lib/db.js';

class UserWallet {
    constructor(data){   
        this.userWalletId = data.user_wallet_id;
        this.userId = data.user_id;
        this.address = data.address;
        this.providerId = data.provider_id;
        this.networkId = data.network_id;
        this.isPrimary = data.is_primary;
    }
    
    static async createTable(){
        const text = `
        CREATE TABLE user_wallets (
            user_wallet_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID,
            addresss VARCHAR (64) NOT NULL,
            network_id UUID,
            provider_id UUID
            is_primary BOOLEAN
        `;
        let response = await db.client.query(text);
        return response;
    }

    static async getByAddress(address){
        const text = 'SELECT * FROM user_wallets WHERE address = $1';
        const values = [address];
        let response = await db.client.query(text, values);
        response = response.rows && response.rows[0];

        if(response){
            return new UserWallet(response);
        }

        return null;
    }

    static async createUserWallet(userId, address){
        const text = 'INSERT INTO user_wallets(user_id, address) VALUES($1, $2) RETURNING *';
        const values = [userId, address];
        
        let response = await db.client.query(text, values);
        response = response.rows && response.rows[0];
        return new UserWallet(response);
    }
}

export default UserWallet;