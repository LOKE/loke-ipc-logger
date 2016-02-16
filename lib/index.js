const chalk = require('chalk');

const OK_PREFIX = chalk.green('OK') + ' ';

const LEVEL_OK = 'info';
const LEVEL_APP_ERR = 'warn';
const LEVEL_SYS_ERR = 'error';

/**
 * Create a new instance
 * @param  {LokeIpc.Communications} ipc
 * @param  {Logger} logger
 */
exports.logRequests = function logRequests(ipc, logger) {
  checkIpc(ipc);
  checkLogger(logger);

  const reqlog = createRequestLogger(logger);

  ipc.on('request:complete', reqlog.logRpcRequest);
  ipc.on('request:error', reqlog.logRpcError);
};

function checkIpc(ipc) {
  if (!ipc.on) throw new Error('Provided IPC Client does not contain an "on" method');
}

function checkLogger(logger) {
  ['info', 'debug', 'error', 'warn'].forEach(function(level) {
    if (typeof logger[level] !== 'function') {
      throw new Error('Provided logger does not contain a "' + level + '" method');
    }
  });
}

function createRequestLogger(logger) {
  function logRpcRequest(evt) {
    try {
      const errLevel = getLogLevel(evt.response);

      this._logger[errLevel](
        getPrefix(errLevel, evt.response) +
        getMethodLogString(evt.service, evt.method) + ': ' +
        (evt.duration || 0).toFixed(1) + 'ms ' +
        getLogText(errLevel, evt.response));
    } catch (err) {
      logger.error('_logRpcRequest error: ' + err.stack);
    }
  }

  function logRpcError(evt) {
    try {
      const methodStr = getMethodLogString(evt.service, evt.method);
      const errorStr = evt.error && (evt.error.stack || evt.error.message);

      logger.warn('RPC Error - ' + methodStr + ': ' + errorStr);
    } catch (err) {
      logger.error('_logRpcError error: ' + err.stack);
    }
  }

  return {
    logRpcRequest: logRpcRequest,
    logRpcError: logRpcError
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
