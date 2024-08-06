const httpStatusCodes = require('../httpStatusCodes');

const BaseApiError = require('../BaseApiError');

class NotFoundError extends BaseApiError {
  constructor(
    message,
    statusCode = httpStatusCodes.NotFound,
    name = 'Not Found',
  ) {
    super(name, statusCode, message);
  }
}

module.exports = NotFoundError;
