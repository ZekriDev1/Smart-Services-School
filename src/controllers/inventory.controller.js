/**
 * SMARTSERVICES Schools - Inventory Controller
 */

const inventoryService = require('../services/inventory.service');
const inventoryRepository = require('../repositories/inventory.repository');

class InventoryController {
  async updateStock(req, res, next) {
    try {
      const { productId } = req.params;
      const updated = await inventoryService.updateInventoryLevel(productId, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Inventory stock level updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async executeSale(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await inventoryService.executeSale(req.body, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Sale transaction processed successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async executePurchase(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await inventoryService.executePurchase(req.body, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Purchase restock transaction processed successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getBarcodeHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const result = await inventoryRepository.getBarcodeHistory(limit, offset);
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

module.exports = new InventoryController();
