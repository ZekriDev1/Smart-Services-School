/**
 * SMARTSERVICES Schools - Input Validation Middleware
 */

const logger = require('../utils/logger');

// Simple XSS sanitization helper
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key].trim());
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

/**
 * Middleware: Global body sanitization against XSS
 */
function sanitizeRequest(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Validate Product Payload
 */
function validateProduct(req, res, next) {
  const { name, barcode, cost_price, sell_price, category_id } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Product name is required and must be a non-empty string');
  }

  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    errors.push('Product barcode is required and must be a non-empty string');
  }

  if (cost_price !== undefined && (typeof cost_price !== 'number' || cost_price < 0)) {
    errors.push('Cost price must be a non-negative number');
  }

  if (sell_price !== undefined && (typeof sell_price !== 'number' || sell_price < 0)) {
    errors.push('Sell price must be a non-negative number');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}$/i;
  if (category_id && !uuidRegex.test(category_id)) {
    errors.push('Category ID must be a valid UUID');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

/**
 * Validate Category Payload
 */
function validateCategory(req, res, next) {
  const { name, key } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Category name is required and must be a non-empty string');
  }

  if (!key || typeof key !== 'string' || key.trim() === '') {
    errors.push('Category key is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

/**
 * Validate Service Request (supporting old frontend)
 */
function validateServiceRequest(req, res, next) {
  const { service_key, service_name, school_name, city, contact_name, contact_phone, contact_email } = req.body;
  const errors = [];

  if (!service_key || typeof service_key !== 'string') errors.push('Service key is required');
  if (!service_name || typeof service_name !== 'string') errors.push('Service name is required');
  if (!school_name || typeof school_name !== 'string') errors.push('School name is required');
  if (!city || typeof city !== 'string') errors.push('City is required');
  if (!contact_name || typeof contact_name !== 'string') errors.push('Contact name is required');
  if (!contact_phone || typeof contact_phone !== 'string') errors.push('Contact phone is required');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contact_email || !emailRegex.test(contact_email)) {
    errors.push('A valid contact email is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

/**
 * Validate Transaction Sales Payload
 */
function validateSale(req, res, next) {
  const { customer_id, items, payment_method } = req.body;
  const errors = [];

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}$/i;
  if (customer_id && !uuidRegex.test(customer_id)) {
    errors.push('Customer ID must be a valid UUID');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Sale items are required and must be a non-empty array');
  } else {
    items.forEach((item, index) => {
      if (!item.product_id || !uuidRegex.test(item.product_id)) {
        errors.push(`Item at index ${index} must contain a valid product_id (UUID)`);
      }
      if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item at index ${index} must contain a quantity greater than zero`);
      }
    });
  }

  if (payment_method && !['cash', 'card', 'bank_transfer', 'cheque'].includes(payment_method)) {
    errors.push('Payment method must be one of: cash, card, bank_transfer, cheque');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

/**
 * Validate Transaction Purchase Payload
 */
function validatePurchase(req, res, next) {
  const { supplier_id, items } = req.body;
  const errors = [];

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}$/i;
  if (supplier_id && !uuidRegex.test(supplier_id)) {
    errors.push('Supplier ID must be a valid UUID');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Purchase items are required and must be a non-empty array');
  } else {
    items.forEach((item, index) => {
      if (!item.product_id || !uuidRegex.test(item.product_id)) {
        errors.push(`Item at index ${index} must contain a valid product_id (UUID)`);
      }
      if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item at index ${index} must contain a quantity greater than zero`);
      }
      if (item.unit_price === undefined || typeof item.unit_price !== 'number' || item.unit_price < 0) {
        errors.push(`Item at index ${index} must contain a non-negative unit_price`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

module.exports = {
  sanitizeRequest,
  validateProduct,
  validateCategory,
  validateServiceRequest,
  validateSale,
  validatePurchase
};
