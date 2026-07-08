/**
 * SMARTSERVICES Schools - Product Routes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validateProduct } = require('../middlewares/validator');

router.get('/', requireAuth, productController.getProducts);
router.get('/:id', requireAuth, productController.getProductById);
router.post('/', requireAuth, requireRole(['admin', 'superadmin']), validateProduct, productController.createProduct);
router.put('/:id', requireAuth, requireRole(['admin', 'superadmin']), validateProduct, productController.updateProduct);
router.delete('/:id', requireAuth, requireRole(['admin', 'superadmin']), productController.deleteProduct);
router.get('/barcode/:barcode', requireAuth, productController.lookupBarcode);

module.exports = router;
