const httpStatusCodes = require('../httpStatusCodes');

const BaseApiError = require('../BaseApiError');

class NotImplementedError extends BaseApiError {
  constructor(
    name,
    statusCode = httpStatusCodes.NotImplemented,
    message = 'Unknown API',
  ) {
    super(name, statusCode, message);
  }
}

module.exports = NotImplementedError;
