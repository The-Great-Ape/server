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