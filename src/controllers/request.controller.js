/**
 * SMARTSERVICES Schools - Request & Invoice Controller
 */

const requestService = require('../services/request.service');

class RequestController {
  async getRequests(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || '';
      const status = req.query.status || null;

      const userId = req.user.id;

      const result = await requestService.listRequests(
        { limit, offset, search, status },
        userId
      );

      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        limit,
        offset
      });
    } catch (err) {
      next(err);
    }
  }

  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const request = await requestService.getRequestDetails(id);
      
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }

      // Authorization check - users can only see their own requests
      if (request.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access Denied' });
      }

      return res.status(200).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  }

  async createRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const request = await requestService.createRequest(req.body, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        data: request
      });
    } catch (err) {
      next(err);
    }
  }

  async createGuestRequest(req, res, next) {
    try {
      const request = await requestService.createGuestRequest(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        data: request
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadGuestFile(req, res, next) {
    try {
      const { request_id } = req.body;
      const file = req.file;

      if (!request_id) {
        return res.status(400).json({ success: false, error: 'request_id is required' });
      }
      if (!file) {
        return res.status(400).json({ success: false, error: 'No file provided' });
      }

      const doc = await requestService.uploadGuestFile(request_id, file);
      return res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  async updateRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.id;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const updated = await requestService.updateRequestStatus(id, status, notes, userId);
      return res.status(200).json({
        success: true,
        message: 'Request status updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const status = req.query.status || null;

      const userId = req.user.id;
      const role = req.user.role;

      const result = await requestService.listInvoices(
        { limit, offset, status },
        userId,
        role
      );

      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        limit,
        offset
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RequestController();
