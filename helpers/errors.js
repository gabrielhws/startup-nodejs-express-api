import log4js from 'log4js';
const log = log4js.getLogger('errors');
exports.handler = function handler(err, _req, res, next) {
  log.fatal(err.message);
  if (err) {
    return res.status(500).send({
      message: __('Something wrong occurred'),
      context: process.env.NODE_ENV !== 'production' && err.message,
    });
  }
  return next();
};
