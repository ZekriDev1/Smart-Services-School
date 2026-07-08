/**
 * SMARTSERVICES Schools - Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getProfile);
router.put('/me', requireAuth, authController.updateProfile);
router.get('/users', requireAuth, requireRole(['admin', 'superadmin']), authController.getUsers);

module.exports = router;
