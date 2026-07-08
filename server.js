/**
 * SMARTSERVICES Schools - Server Entrypoint
 */

// Load environment configurations
require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

// Create HTTP server wrapping Express application
const server = http.createServer(app);

// Graceful shutdown handling
const shutdown = () => {
  logger.info('Stopping server...');
  server.close(() => {
    logger.info('Server stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Listen
server.listen(PORT, () => {
  logger.info(`\n🚀 SMARTSERVICES Schools server running at http://localhost:${PORT}`);
  logger.info(`📁 Serving static assets & REST API`);
  logger.info(`🔧 Configuration endpoint at http://localhost:${PORT}/api/config\n`);
});