const logger = require('$lib/logger');

class Util {
    static sendResponse() {
        response.status(httpCode).send(status);

    }

    static sendErrorRespons() {
        response.status(500).send(response);

    }

    static handleError() {
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

export default Util;