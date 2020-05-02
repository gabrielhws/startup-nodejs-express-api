import os from 'os';
import fs from 'fs';
import log4js from 'log4js';
import mongoose from 'mongoose';
import config from '../../config/config';
import redis from 'redis';
const log = log4js.getLogger('status');
const Dummy = mongoose.model(
  'Dummy',
  new mongoose.Schema({
    created: { type: Date, default: Date.now },
  })
);
async function getStatus(_req, res) {
  let status = {
    mongo: {
      status:
        mongoose.Connection.STATES.connected === mongoose.connection.readyState
          ? 'OK'
          : 'NOK',
      read: 'NOK',
      write: 'NOK',
    },
    redis: {
      status: 'NOK',
      read: 'NOK',
      write: 'NOK',
    },
    server: {
      uptime: Math.round(process.uptime()),
      mem_total: Math.round(os.totalmem() / 1024 / 1024),
      mem_free: Math.round(os.freemem() / 1024 / 1024),
    },
    api: {
      version: (function version() {
        let apiVersion;
        try {
          const packageJson = fs.readFileSync('package.json');
          apiVersion = JSON.parse(packageJson).version;
        } catch (err) {
          // ignore apiVersion gathering
        }
        return apiVersion;
      })(),
    },
  };
  try {
    const dummy = new Dummy();

    status.mongo.write = (await dummy.save()) ? 'OK' : 'NOK';
    status.mongo.read = (await Dummy.findById(dummy._id)) ? 'OK' : 'NOK';
    status.mongo.status =
      status.mongo.status === 'OK' &&
      status.mongo.read === 'OK' &&
      status.mongo.write === 'OK'
        ? 'OK'
        : 'NOK';

    await dummy.remove();

    if (status.mongo.status !== 'OK') {
      throw new Error('API is not running correctly');
    }

    const redisPromise = new Promise(function redisPromise(resolve) {
      const { port, host } = config.redis;
      const client = redis.createClient(port, host);
      client.on('error', function err(error) {
        log.error('Redis connection failed %s', JSON.stringify(error));
        client.quit();
        resolve();
      });
      client.on('connect', function connect() {
        if (client.connected) {
          status.redis.status = 'OK';
        }

        Promise.all([
          new Promise((resv) => {
            client.set(
              'dummy',
              JSON.stringify({ foo: 'bar' }),
              'EX',
              10,
              function set(error) {
                if (error) {
                  throw error;
                }
                status.redis.write = 'OK';
                resv();
              }
            );
          }),
          new Promise((resv) => {
            client.get('dummy', function get(error, value) {
              if (error) {
                throw error;
              }
              status.redis.read = 'OK';
              return resv(value);
            });
          }),
        ]).then(() => {
          status.redis.status = 'OK';
          return resolve();
        });
      });
    });

    await redisPromise;
  } catch (error) {
    log.fatal('Could not generate stats %s', JSON.stringify(error));
    return res.status(500).send(status);
  }

  return res.status(200).send(status);
}

export default {
  getStatus,
};
