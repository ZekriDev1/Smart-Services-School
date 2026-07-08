/**
 * SMARTSERVICES Schools - Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { requireAuth } = require('../middlewares/auth');

router.get('/', requireAuth, productController.getProducts);
router.get('/:id', requireAuth, productController.getProductById);
router.get('/barcode/:barcode', requireAuth, productController.lookupBarcode);

module.exports = router;
