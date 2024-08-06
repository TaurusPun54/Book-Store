const httpStatusCodes = require('../httpStatusCodes');

const BaseApiError = require('../BaseApiError');

class InternalServerError extends BaseApiError {
  constructor(
    name,
    statusCode = httpStatusCodes.InternalServer,
    message = 'Server Error',
  ) {
    super(name, statusCode, message);
  }
}

module.exports = InternalServerError;
