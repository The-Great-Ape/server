const utils = require('$lib/util');
const moment = require('moment');

const testController = {
    test: async (req, res) => {
        try {
            let result = process.env.NODE_ENV.toUpperCase() + ' API is currently running as of ' + moment().format('MMMM Do YYYY, h:mm:ss a');
            return utils.sendResponse(res, 200, result);
        } catch (error) {
            return utils.sendResponse(res, 500, error);
        }
    }
};

module.exports.Controller = testController;
module.exports.controller = function (app) {
    app.get('/v1/test', testController.test);
};
