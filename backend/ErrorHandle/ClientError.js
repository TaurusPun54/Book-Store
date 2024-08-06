const BadRequest = require('./ClientError/BadRequest');

const Unauthorized = require('./ClientError/Unauthorized');

const Forbidden = require('./ClientError/Forbidden');

const NotFound = require('./ClientError/NotFound');

module.exports = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
};
