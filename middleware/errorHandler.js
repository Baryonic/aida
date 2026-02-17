/**
 * Centralized error-handling middleware.
 */

'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${err.stack || err.message || err}`);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
