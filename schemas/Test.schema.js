const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    discordId: {
        type: String,
    }
},
{
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

class User {
    static async test() {
        try {
            let result = process.env.NODE_ENV.toUpperCase() + ' API is currently running as of ' + moment().format('MMMM Do YYYY, h:mm:ss a');
            return result;
        }
        catch (err) {
            utils.handleError(err);
        }
    }
}

userSchema.loadClass(User);

module.exports = mongoose.model('User', userSchema, 'users');
