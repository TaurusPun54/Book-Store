const httpStatusCodes = require('../httpStatusCodes');

const BaseApiError = require('../BaseApiError');

class UnauthorizedError extends BaseApiError {
  constructor(
    message,
    statusCode = httpStatusCodes.Unauthorized,
    name = 'Unauthorized',
  ) {
    super(name, statusCode, message);
  }
}

module.exports = UnauthorizedError;
