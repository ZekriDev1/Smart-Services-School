/**
 * SMARTSERVICES Schools - Inventory Routes
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validateSale, validatePurchase } = require('../middlewares/validator');

router.put('/stock/:productId', requireAuth, requireRole(['admin', 'superadmin']), inventoryController.updateStock);
router.post('/sales', requireAuth, validateSale, inventoryController.executeSale);
router.post('/purchases', requireAuth, validatePurchase, inventoryController.executePurchase);
router.get('/history', requireAuth, requireRole(['admin', 'superadmin']), inventoryController.getBarcodeHistory);

module.exports = router;
