/**
 * SMARTSERVICES Schools - Express App Setup
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const apiRoutes = require('./routes/api.routes');
const errorHandler = require('./middlewares/errorHandler');
const { sanitizeRequest } = require('./middlewares/validator');

const app = express();

// Apply global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard logger
app.use(morgan('dev'));

// XSS / Payload sanitization middleware
app.use(sanitizeRequest);

// Serve API endpoints
app.use('/api', apiRoutes);

// Serve frontend assets statically
app.use(express.static(path.join(__dirname, '..')));

// Handle 404 fallback (Redirect to index.html or return file not found for requests that are not APIs)
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.url} not found` });
  }
  res.status(404).sendFile(path.join(__dirname, '..', '404.html'), (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

// Attach global error handler
app.use(errorHandler);

module.exports = app;
