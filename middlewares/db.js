import Mongoose from 'mongoose';
import config from '../config/config.js';
import log4js from 'log4js';
import redis from 'redis';
import cachegoose from 'cachegoose';
import _ from 'lodash';
const log = log4js.getLogger('db');
const env = _.get(process.env, 'NODE_ENV', 'development');
if (_.get(process.env, 'LOG_QUERIES', env === 'local')) {
  Mongoose.set('debug', true);
  log.trace('Displaying queries');
}
let url = '';
if (env === 'local') {
  log.info('Local DB Start - NODE_ENV: [%s]', env);
  url = 'mongodb://' + config.database.host + '/' + config.database.database;
} else {
  log.info('NODE_ENV: [%s]', env);
  url =
    'mongodb://' +
    config.database.user +
    ':' +
    config.database.password +
    '@' +
    config.database.host +
    '/' +
    config.database.database;
}
Mongoose.Promise = global.Promise;
Mongoose.connect(url, {
  useFindAndModify: false,
  useNewUrlParser:true,
  useUnifiedTopology: true,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
});
const db = Mongoose.connection;
db.on('error', function error(err) {
  log.fatal(JSON.stringify(err));
});
db.once('open', function callback() {
  log.info('Connection succeeded.');
});
db.on('disconnected', function disconnected() {
  log.info('Mongoose default connection disconnected');
});
process.on('SIGINT', function SIGINT() {
  db.close(function close() {
    log.info(
      'Mongoose default connection disconnected through app termination'
    );
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  });
});

if (config.features.enableRedis) {
  const { port, host } = config.redis;
  const defaults = {
    // eslint-disable-next-line max-len
    prefix: `${process.env.npm_package_name}-${
      process.env.npm_package_version
    }-${process.env.NODE_ENV}`,
  };

  const client = redis.createClient(port, host);
  client.on('error', function err(error) {
    log.error(
      'Redis connection failed, disabling BD cache %s',
      JSON.stringify(error)
    );
    client.quit();
    cachegoose(Mongoose, {
      ...defaults,
      engine: 'memory',
      ttl: 10,
    });
  });
  client.on('connect', function connect() {
    cachegoose(Mongoose, {
      ...defaults,
      engine: client.connected ? 'redis' : 'memory',
      ttl: 3600,
      port: process.env.REDIS_PORT || port,
      host: process.env.REDIS_PORT || host,
    });
  });
}
exports.Mongoose = Mongoose;
exports.mongo = db;
