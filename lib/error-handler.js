const utils = require('$lib/util');
const logger = require('$lib/logger');

class ErrorHandler {

    // eslint-disable-next-line no-unused-vars
    static handleError(err, req, res, next) {
        if (err) {
            logger.error(err);

            if (process.env.NODE_ENV === 'production') {
                return utils.sendErrorResponse(res);
            }
            else {
                let errorObject = {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                    code: err.code,
                    status: 500
                };

                return res
                    .status(errorObject.status)
                    .json(errorObject);
            }
        }
        else {
            return utils.sendErrorResponse(res);
        }
    }
}

module.exports = ErrorHandler;
