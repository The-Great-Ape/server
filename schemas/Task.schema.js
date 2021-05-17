let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let logger = require('$common/lib/logger');

let schema = new Schema({
    name: String,
    description: String,
    lastRunAt: Date,
    lastErrorAt: Date,
    lastError: String
},
{
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

schema.virtual('interval');
schema.virtual('run');

class Task {
    static async createTask(task) {
        let result = {};
        if (task) {
            logger.info(`[AGGREGATOR][Info]: Scheduling ${task.name}`);
            let log = { name: task.name, description: task.description };

            let tasks = await this.findOneAndUpdate({ name: task.name }, log, { upsert: true });
            if (tasks && Object.keys(tasks).length) {
                tasks.run = task.run;
                tasks.interval = task.interval;
                result = tasks;
            }
        }
        return result;
    }

    static async getTasks() {
        let result = this.find({});
        return result;
    }

    static async findTask(name) {
        let task = await this.findOne(name);
        return task;
    }

    async runTask() {
        try {
            await this.run();
            await this.onSuccess();

        } catch (err) {
            await this.onError(err);
        }
    }

    async onError(err) {
        logger.error(`[AGGREGATOR][Error]: ${err}`);
        this.lastErrorAt = Date.now();
        this.lastError = err;
        await this.save();
    }

    async onSuccess() {
        logger.info(`[AGGREGATOR][Info]: Ran ${this.name}`);
        this.lastRunAt = Date.now();
        await this.save();
    }
}

schema.loadClass(Task);
module.exports = mongoose.model('Task', schema, 'aggregatorTasks');
