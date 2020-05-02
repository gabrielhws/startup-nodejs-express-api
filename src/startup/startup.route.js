import pkg from '../../package.json';
import startupController from './startup.controller';
module.exports = function exports(app) {
  app.route('/').get(function index(_req, res) {
    res
      .status(200)
      .send({ message: `RESTful API v${pkg.version} running =D` });
  });
  app.route('/health').get(startupController.getStatus);
};
