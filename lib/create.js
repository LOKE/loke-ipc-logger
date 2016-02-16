var chalk = require('chalk');

var OK_PREFIX = chalk.green('OK') + ' ';

var LEVEL_OK = 'info';
var LEVEL_APP_ERR = 'warn';
var LEVEL_SYS_ERR = 'error';

/**
 * Creates a new request logger for the provided logger
 * @param  {Logger} logger - the logger to use
 */
module.exports = exports = function createRequestLogger(logger) {
  return {
    logRpcRequest: function logRpcRequest(evt) {
      try {
        var errLevel = getLogLevel(evt.response);

        logger[errLevel](
          getPrefix(errLevel, evt.response) +
          getMethodLogString(evt.service, evt.method) + ': ' +
          (evt.duration || 0).toFixed(1) + 'ms ' +
          getLogText(errLevel, evt.response));
      } catch (err) {
        logger.error('_logRpcRequest error: ' + err.stack);
      }
    },
    logRpcError: function logRpcError(evt) {
      try {
        var methodStr = getMethodLogString(evt.service, evt.method);
        var errorStr = evt.error && (evt.error.stack || evt.error.message);

        logger.warn('RPC Error - ' + methodStr + ': ' + errorStr);
      } catch (err) {
        logger.error('_logRpcError error: ' + err.stack);
      }
    }
  };
}

function getMethodLogString(service, method) {
  return chalk.cyan('rpc/' + service + '/' + method);
}

function getLogLevel(response) {
  if (!response || !response.error) return LEVEL_OK;
  if (response.error.code === -32000) return LEVEL_APP_ERR;
  return LEVEL_SYS_ERR;
}

function getPrefix(logLevel, response) {
  switch (logLevel) {
    case LEVEL_SYS_ERR:
      return chalk.red('ERR ' + response.error.code) + ' ';
    case LEVEL_APP_ERR:
      return chalk.yellow('ERR ' + response.error.code) + ' ';
    default:
      return OK_PREFIX;
  }
}

function getLogText(logLevel, response) {
  switch (logLevel) {
    case LEVEL_OK:
      return '';
    default:
    case LEVEL_APP_ERR:
      return response.error.message;
  }
}
