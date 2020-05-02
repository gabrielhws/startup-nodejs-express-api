import i18n from 'i18n';
import path from 'path';
import log4js from 'log4js';
import moment from 'moment';
const log = log4js.getLogger('i18n');
export default (app) => {
  const devMode = !!process.env.I18N_UPDATE_FILES;
  i18n.configure({
    locales: devMode ? ['en-US', 'es-ES', 'pt-BR'] : [process.env.LANG_ENV],
    defaultLocale: process.env.LANG_ENV,
    // fall backs: { 'en': 'en-US', 'es': 'es-ES', 'pt': 'pt-BR' },
    syncFiles: devMode,
    autoReload: devMode,
    updateFiles: devMode,
    extension: '.json',
    directory: path.join(__dirname, './../locales'),
    register: global,
    // defaultLocale: process.env.LANG_ENV,
    logDebugFn: function logDebugFn(msg) {
      log.debug(msg);
    },
    logWarnFn: function logWarnFn(msg) {
      log.warn(msg);
    },
    logErrorFn: function logErrorFn(msg) {
      log.error(msg);
    },
    preserveLegacyCase: true,
  });
  app.use(function use(_req, _res, next) {
    i18n.setLocale(process.env.LANG_ENV);
    next();
  });
  moment.locale(process.env.LANG_ENV);
  return i18n.init;
};
