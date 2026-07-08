/**
 * SMARTSERVICES Schools - Product Controller
 */

const productRepository = require('../repositories/product.repository');
const inventoryService = require('../services/inventory.service');

class ProductController {
  async getProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || '';
      const categoryId = req.query.categoryId || null;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : null;
      const sortBy = req.query.sortBy || 'name';
      const sortOrder = req.query.sortOrder || 'asc';

      const result = await productRepository.listAll({
        limit,
        offset,
        search,
        categoryId,
        isActive,
        sortBy,
        sortOrder
      });

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

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await inventoryService.getProductDetails(id);
      
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const userId = req.user.id;
      const product = await inventoryService.createProduct(req.body, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await inventoryService.updateProduct(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await productRepository.delete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async lookupBarcode(req, res, next) {
    try {
      const { barcode } = req.params;
      const userId = req.user.id;
      const result = await inventoryService.lookupBarcode(barcode, userId);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
