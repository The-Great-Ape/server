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
    addUser(user) {
        let { discordId, solAddress } = user;

        if (discordId && solAddress) {
            await this.create({
                discordId,
                solAddress,
                matchHistory: []
            })
        }
    }

    recordMatch(match) {
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
