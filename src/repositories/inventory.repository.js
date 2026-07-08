/**
 * SMARTSERVICES Schools - Inventory Repository
 */

const { supabase } = require('../config/db');

class InventoryRepository {
  async findByProductId(productId) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async initialize(productId, minStock = 5, maxStock = 100, binLocation = '') {
    const { data, error } = await supabase
      .from('inventory')
      .insert([
        {
          product_id: productId,
          quantity: 0,
          min_stock: minStock,
          max_stock: maxStock,
          bin_location: binLocation
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(productId, updateData) {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: updateData.quantity,
        min_stock: updateData.min_stock,
        max_stock: updateData.max_stock,
        bin_location: updateData.bin_location,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStock(productId, quantityChange) {
    // PostgREST doesn't support relative increments easily without direct SQL.
    // If hasDirectDb is true, we could use SQL.
    // Otherwise, we read-then-write or use a RPC.
    // Let's implement read-then-write first or fallback.
    const inv = await this.findByProductId(productId);
    if (!inv) {
      throw new Error(`Inventory record not found for product: ${productId}`);
    }

    const newQuantity = inv.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error(`Insufficient stock level. Product ${productId} current stock: ${inv.quantity}, requested deduction: ${Math.abs(quantityChange)}`);
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logBarcodeScan(barcode, productId, actionType, userId = null, notes = '') {
    const { data, error } = await supabase
      .from('barcode_history')
      .insert([
        {
          barcode,
          product_id: productId,
          action_type: actionType,
          user_id: userId,
          notes,
          scan_date: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBarcodeHistory(limit = 50, offset = 0) {
    const { data, count, error } = await supabase
      .from('barcode_history')
      .select('*, product:products(id, name, barcode), user:users(id, email, full_name)', { count: 'exact' })
      .order('scan_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, total: count };
  }
}

module.exports = new InventoryRepository();
