import mongoose from 'mongoose';

class Network extends mongoose.Model {

}

let schema = new mongoose.Schema({
    name: String,
    abi: Object,
    rpcURL: String
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

const model = mongoose.model(Network, schema, 'networks');

export default model;
