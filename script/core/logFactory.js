/**
 * 日志工厂
 * Created by cly on 2017/5/2.
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment');
const stackTrace = require('stack-trace');
const _ = require('lodash');
//const RotateFile = require('winston-daily-rotate-file');
const env = process.env.NODE_ENV;
//const logDir = path.resolve('.','log');
let logger;
const dateFormat = function () {
  return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
}
logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      timestamp: dateFormat,
      colorize: true
    }),
    new (winston.transports.File)({ timestamp: dateFormat,filename:'all.log'})

  ]
});

logger.dbLogger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      timestamp: dateFormat,
      colorize: true
    }),
    new (winston.transports.File)({ timestamp: dateFormat,filename:'meizidb.log'})
  ]
});
if (env === 'product') {
  //处理物理文件日志
}

const originLoggerMethod = logger.error;

logger.error = function () {
  const cellSite = stackTrace.get()[1];
  originLoggerMethod.apply(logger,[
    arguments[0]+'\n',
    {
      filePath:cellSite.getFileName(),
      lineNumber:cellSite.getLineNumber()
    }
  ]);
}



module.exports = logger;
