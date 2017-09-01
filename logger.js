var log4js = require('log4js');


log4js.configure('./config/log4js.json')

var levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL
};

var logger = log4js.getLogger("express");
var consolelogger = log4js.getLogger("console");
var errlogger = log4js.getLogger("error");
var warnlogger = log4js.getLogger("warn");
// logger.setLevel(levels.debug);

console.log = logger.info.bind(consolelogger);
console.error = logger.error.bind(errlogger);
console.warn = logger.warn.bind(warnlogger);

module.exports = log4js.connectLogger(logger);