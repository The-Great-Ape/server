exports.sendResponse = function (response, httpCode, status) {
    response.status(httpCode).send(status);
};

exports.sendErrorResponse = function (response) {
    response.status(500).send(response);
};