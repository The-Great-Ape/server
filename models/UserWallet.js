import db from '../lib/db.js';

class UserWallet {
    constructor(data) {
        this.userWalletId = data.user_wallet_id;
        this.userId = data.user_id;
        this.address = data.address;
        this.providerId = data.provider_id;
        this.networkId = data.network_id;
        this.isPrimary = data.is_primary;
    }

    static async getByAddress(address) {
        const text = 'SELECT * FROM user_wallets WHERE address = $1';
        const values = [address];
        let response = await db.query(text, values);
        response = response[0];

        if (response) {
            return new UserWallet(response);
        }

        return null;
    }

    static async getByUser(userId) {
        const text = 'SELECT * FROM user_wallets WHERE user_id = $1';
        const values = [userId];
        let response = await db.query(text, values);

        if (response) {
            response = response.map(wallet => new UserWallet(wallet));
            return response;
        }

        return [];
    }

    static async createUserWallet(userId, address) {
        let wallet = await UserWallet.getByAddress(address);

        if (!wallet) {
            const text = 'INSERT INTO user_wallets(user_id, address) VALUES($1, $2) RETURNING *';
            const values = [userId, address];

            let response = await db.query(text, values);
            response = response[0];
            return new UserWallet(response);
        } else if (wallet.userId === userId) {
            return wallet;
        }
    }

    async save() {
        const text = 'UPDATE user_wallets SET user_id = $1, address = $2 WHERE user_wallet_id = $3';
        const values = [this.userId, this.address, this.userWalletId];
        let response = await db.query(text, values);
        return response;
    }
}

export default UserWallet;