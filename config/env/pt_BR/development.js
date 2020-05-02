module.exports = {
  whitelist: [
    /https?:\/\/localhost:([34]001|7004|80[09][0-2]|9000)/,
    /https?:\/\/prerender.io/,
  ],
  database: {
    host: process.env.MONGO_URL || '',
    database: process.env.MONGO_DB || '',
    user: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASS || '',
  },
  log4js: {
    appenders: {
      app: { type: 'file', filename: 'logs/dev.app.log' },
      console: { type: 'console' },
    },
    categories: {
      default: { appenders: ['console', 'app'], level: 'trace' },
    },
  },
  mail_default: 'sendgrid', // sendgrid or mandrill or mailchip
};
