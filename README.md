# LOKE-IPC Logger
Standard logging module for LOKE-IPC.

## Using

```js
var lokeIpc = require('loke-ipc');
var lokeIpcLogger = require('loke-ipc-logger');
var myLogger = require('some-logger');

lokeIpc.connect().then(function(conn) {
  lokeIpcLogger.logRequests(conn, logger);
});
```
