/**
 * SMARTSERVICES Schools - Master API Router
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const inventoryRoutes = require('./inventory.routes');
const requestRoutes = require('./request.routes');

// Config endpoint (legacy/utility for configuration parameters mapping)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

router.get('/config', (req, res) => {
  res.status(200).json({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/requests', requestRoutes);

module.exports = router;
