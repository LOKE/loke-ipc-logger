exports.ipc = function checkIpc(ipc) {
  if (!ipc.on) throw new Error('Provided IPC Client does not contain an "on" method');
};

exports.logger = function checkLogger(logger) {
  ['info', 'debug', 'error', 'warn'].forEach(function(level) {
    if (typeof logger[level] !== 'function') {
      throw new Error('Provided logger does not contain a "' + level + '" method');
    }
  });
};
