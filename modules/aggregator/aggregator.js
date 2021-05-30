const logger = require('$lib/logger');
const schedule = require('node-schedule');
const Task = require('$schemas/Task.schema');

class Aggregator {
    static EVERY_X_MINUTES(minutes) {
        return '*/' + minutes + ' * * * *';
    }

    static get EVERY_DAY() {
        return { second: 59, minute: 59, hour: 23 };
    }

    static get EVERY_MORNING() {
        return { second: 0, minute: 0, hour: 0 };
    }

    static get EVERY_HOUR() {
        return { minute: 0 };
    }

    static get EVERY_HALF_HOUR() {
        return { minute: 30 };
    }

    static get EVERY_MINUTE() {
        return { second: 0 };
    }

    static get EVERY_FIVE_MINUTES() {
        return { minute: 5 };
    }

    static get EVERY_MONTH() {
        return { date: 1, hour: 0, minute: 0 };
    }

    static get EVERY_SECOND() {
        return { second: 1 };
    }

    static get START_OF_WEEK() {
        return { second: 0, minute: 0, hour: 0, dayOfWeek: 1 };
    }

    static get tasks() {
        return [
            {
                name: 'test',
                description: 'test',
                interval: Aggregator.EVERY_DAY,
                run: async () => {
                    console.log('test');
                }
            }
        ];
    }

    constructor() {
        this.id = process.pid;
        this.jobs = [];
    }

    schedule(task) {
        if (!(task && task.runTask)) return;

        let job = schedule.scheduleJob(task.interval, task.runTask.bind(task));
        return job;
    }

    async startTasks() {
        try {
            this.jobs = [];

            for (let i = 0; i < Aggregator.tasks.length; i++) {
                let task = Aggregator.tasks[i];
                task = await Task.createTask(task);
                let job = this.schedule(task);
                this.jobs.push(job);
            }

        } catch (err) {
            logger.error(`[Aggregator][Error]: ${err}`);
        }
    }

    onClose() {
        try {
            this.jobs.forEach(job => {
                job.cancel();
            });
        } catch (err) {
            logger.error(`[Aggregator][Error]: ${err}`);
        }

    }
}

module.exports = Aggregator;
