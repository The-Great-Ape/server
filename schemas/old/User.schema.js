const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Wallet = require('./Wallet.schema');

const userSchema = new Schema({
    primaryWallet: String,
    wallets: [{
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    }],
    accounts: [{
        discordId: {
            type: String,
            required: false
        },
        twitterId: {
            type: String,
            required: false
        }
    }]
},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

class User {
    static async createUser(primaryWallet, type) {
        if (primaryWallet) {
            let user = await this.create(
                { primaryWallet }
            );

            if (user) {
                let wallet = await Wallet.create({
                    publicKey: primaryWallet,
                    userId: user._id,
                    name: 'Primary',
                    type: type
                });

                user.wallets = [wallet];
                await user.save();
            }

            return user;
        }
    }

    static async getUser(primaryWallet) {
        if (primaryWallet) {
            let user = await this.findOne(
                { primaryWallet }
            );

            if (!user) {
                let user = await User.createUser(primaryWallet, 'SOLLET');
            }

            return user;
        }
    }
}

userSchema.loadClass(User);

module.exports = mongoose.model('User', userSchema, 'users');
