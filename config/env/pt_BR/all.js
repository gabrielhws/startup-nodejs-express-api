module.exports = {
  port: process.env.SERVER_PORT || 3000,
  domain: process.env.DOMAIN_REST || '',
  title: process.env.TITLE || 'Startup NodeJS, ExpressJS Rest API',
  email: process.env.EMAIL || 'gabrielhws@gmail.com',
  website:process.env.WEBSITE || '',
  token_secret: process.env.TOKEN_SECRET || 'startup-nodejs-api',
  header_secret: process.env.HEADER_SECRET || 'startup-nodejs-api',
  template_engine: 'swig',
  redis: false,
  features: {
    enableSocketIO: true,
    enableRedis: true,
    userAuth: false,
    demands: { create_hunter_from_form: true },
  },
  auth: {
    token_duration: { days: 3 },
  }
};
