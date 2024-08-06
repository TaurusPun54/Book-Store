const httpStatusCodes = require('../httpStatusCodes');

const BaseApiError = require('../BaseApiError');

class BadRequestError extends BaseApiError {
  constructor(
    message,
    statusCode = httpStatusCodes.BadRequest,
    name = 'Bad Request',
  ) {
    super(name, statusCode, message);
  }
}

module.exports = BadRequestError;
