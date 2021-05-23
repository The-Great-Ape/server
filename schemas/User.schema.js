const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GAME_TYPES = {
    POKER: 'POKER'
};

const userSchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    solAddress: {
        type: String,
        required: true
    },
    matchHistory: [{
        game: {
            type: String,
            enum: GAME_TYPES
        },
        place: {
            type: Number
        }
    }],
    rank: {
        type: Number,
    }
},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

class User {
    static async addUser(discordId, solAddress) {
        console.log(discordId, solAddress);
        if (discordId && solAddress) {
            await this.findOneAndUpdate(
                { discordId },
                { $set: { discordId, solAddress } },
                { upsert: true, new: true }
              );
        }
    }

    static async recordMatch(match) {
        let { userId, game, place } = match;

        if (userId && game && place) {
            await this.update({ _id: userId }, {
                $push: {
                    matchHistory: { game, place }
                }
            })
        }
    }
}

userSchema.loadClass(User);

module.exports = mongoose.model('User', userSchema, 'users');
