/**
 * SMARTSERVICES Schools - Request & Invoice Routes
 */

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validateServiceRequest } = require('../middlewares/validator');

router.get('/', requireAuth, requestController.getRequests);
router.get('/invoices', requireAuth, requestController.getInvoices);
router.get('/:id', requireAuth, requestController.getRequestById);
router.post('/', requireAuth, validateServiceRequest, requestController.createRequest);
router.put('/:id/status', requireAuth, requireRole(['admin', 'superadmin']), requestController.updateRequestStatus);

module.exports = router;
