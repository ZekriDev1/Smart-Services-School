/**
 * SMARTSERVICES Schools - Request & Invoice Routes
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateServiceRequest } = require('../middlewares/validator');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.get('/', requireAuth, requestController.getRequests);
router.get('/invoices', requireAuth, requestController.getInvoices);
router.get('/:id', requireAuth, requestController.getRequestById);
router.post('/', requireAuth, validateServiceRequest, requestController.createRequest);
router.post('/guest', validateServiceRequest, requestController.createGuestRequest);
router.post('/guest/upload', upload.single('file'), requestController.uploadGuestFile);

module.exports = router;
