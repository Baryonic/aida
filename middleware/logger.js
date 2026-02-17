/**
 * Custom request-logging middleware.
 * Logs method, URL, status, and response time.
 */

'use strict';

function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `${timestamp}  ${color}${status}${reset}  ${req.method.padEnd(7)} ${req.originalUrl}  ${duration}ms`
    );
  });

  next();
}

module.exports = logger;
