import mongoose from 'mongoose';

import Wallets from './wallet.js';

class User extends mongoose.Model {

}

let schema = new mongoose.Schema({
    discordId: String,
    wallets: [Wallets]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

const model = mongoose.model(User, schema, 'users');

export default model;
