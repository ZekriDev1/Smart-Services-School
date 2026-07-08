/**
 * SMARTSERVICES Schools - Logger Utility
 */

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
};

const logger = {
  info: (msg) => console.log(formatMessage('info', msg)),
  warn: (msg) => console.warn(formatMessage('warn', msg)),
  error: (msg, err) => {
    console.error(formatMessage('error', msg));
    if (err && err.stack) {
      console.error(err.stack);
    } else if (err) {
      console.error(err);
    }
  },
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('debug', msg));
    }
  }
};

module.exports = logger;
