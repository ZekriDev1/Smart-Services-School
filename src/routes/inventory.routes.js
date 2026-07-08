/**
 * SMARTSERVICES Schools - Inventory Routes
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateSale, validatePurchase } = require('../middlewares/validator');

router.post('/sales', requireAuth, validateSale, inventoryController.executeSale);
router.post('/purchases', requireAuth, validatePurchase, inventoryController.executePurchase);

module.exports = router;
