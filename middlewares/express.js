import config from '../config/config';
import errors from './../helpers/errors';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import express from 'express';
import cors from 'cors';
import log4js from 'log4js';
import consolidate from 'consolidate';
import userAgent from 'express-useragent';
import addRequestId from 'express-request-id';
import responseTime from 'response-time';
import i18n from './i18n';
import helmet from 'helmet';
module.exports = function exports() {
  const app = express();
  config.getGlobbedFiles('./src/*/*.model.js').forEach(function forEach(modelPath) {
      // eslint-disable-next-line global-require
      require(path.resolve(modelPath));
  });
  let whitelist = config.whitelist;
  let corsOptions = {
    origin: function orig(origin, callback) {
      let originIsWhitelisted =
        whitelist.indexOf(origin) !== -1 ||
        !origin ||
        whitelist.reduce((result, domain) => {
          return result || domain.test(origin);
        }, false);
      if (originIsWhitelisted) {
        callback(null, originIsWhitelisted);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 200,
  };
  app.use(i18n(app));
  app.use(responseTime());
  app.use(addRequestId());
  app.use(cors(corsOptions));
  app.use(userAgent.express());
  app.disable('etag');
  app.use(helmet());
  app.disable('x-powered-by');
  app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(methodOverride());
  app.use(errors.handler);
  config.getGlobbedFiles('./src/*/*.router.js').forEach(function forEach(routePath) {
      // eslint-disable-next-line global-require
      require(path.resolve(routePath))(app);
  });
  app.engine('html', consolidate[config.template_engine]);
  app.locals.cache = 'memory';
  app.set('view engine', 'html');
  //app.set('views', './templates');
  return app;
};
