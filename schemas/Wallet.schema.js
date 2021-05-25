const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WALLET_TYPES = {
    SOLLET: 'SOLLET'
};

const walletSchema = new Schema({
    name:  {
        type: String,
        required: true
    },
    publicKey:  {
        type: String,
        enum: WALLET_TYPES,
        required: true
    },
    type: {
        type: String,
        enum: WALLET_TYPES,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

class Wallet {
    static async addWallet(wallet) {
        let {userId, publicKey, type, name, isPrimary} = wallet;
        isPrimary = isPrimary || false;

        if (userId && publicKey && type) {
            await this.findOneAndUpdate(
                { publicKey },
                { $set: { userId, publicKey, type, name, isPrimary } },
                { upsert: true, new: true }
              );
        }
    }
}

walletSchema.loadClass(Wallet);

module.exports = mongoose.model('Wallet', walletSchema, 'wallets');
