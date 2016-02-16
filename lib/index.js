var validate = require('./validate');
var createRequestLogger = require('./create');

/**
 * Create a new instance
 * @param  {LokeIpc.Communications} ipc
 * @param  {Logger} logger
 */
exports.logRequests = function logRequests(ipc, logger) {
  validate.ipc(ipc);
  validate.logger(logger);

  var reqlog = createRequestLogger(logger);

  ipc.on('request:complete', reqlog.logRpcRequest);
  ipc.on('request:error', reqlog.logRpcError);

  logger.info('LOKE-IPC requests are now being logged');
};
