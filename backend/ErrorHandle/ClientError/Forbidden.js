const httpStatusCodes = require('../httpStatusCodes');

const BaseApiError = require('../BaseApiError');

class ForbiddenError extends BaseApiError {
  constructor(
    message,
    statusCode = httpStatusCodes.Forbidden,
    name = 'Forbidden',
  ) {
    super(name, statusCode, message);
  }
}

module.exports = ForbiddenError;
