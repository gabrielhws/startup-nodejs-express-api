import log4js from 'log4js';
import http from 'http';
import config from './config';
import db from './../middlewares/db' ;
import Express from './../middlewares/express';
log4js.configure(config.log4js);
if (!process.env.LANG_ENV) {
  process.env.LANG_ENV = 'pt-BR';
}
const log = log4js.getLogger('startup');
const start = new Date();
const app = Express(db.Mongoose);
const server = http.createServer(app);
server.listen(config.port);
export default {
  app,
  server,
};
log.info(`RESTful API running in port: ${config.port}`);
log.info('Bootstrap: %dms', new Date() - start);
