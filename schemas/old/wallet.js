import mongoose from 'mongoose';

class walletAddress extends mongoose.Model {

}

let schema = new mongoose.Schema({
    address: String,
    networkId: mongoose.SchemaTypes.ObjectId,
    userId: mongoose.SchemaType.ObjectId
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

schema.virtual('user', {
    ref: 'users',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

schema.virtual('network', {
    ref: 'networks',
    localField: 'networkId',
    foreignField: '_id',
    justOne: true
});

const model = mongoose.model(Wallet, schema, 'wallets');

export default model;
