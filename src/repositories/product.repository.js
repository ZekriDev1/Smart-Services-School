/**
 * SMARTSERVICES Schools - Product Repository
 */

const { supabase } = require('../config/db');

class ProductRepository {
  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, key)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findByBarcode(barcode) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, key)')
      .eq('barcode', barcode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: productData.name,
          barcode: productData.barcode,
          description: productData.description || '',
          category_id: productData.category_id || null,
          unit: productData.unit || 'pcs',
          cost_price: productData.cost_price || 0.00,
          sell_price: productData.sell_price || 0.00,
          is_active: productData.is_active !== undefined ? productData.is_active : true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        barcode: productData.barcode,
        description: productData.description,
        category_id: productData.category_id,
        unit: productData.unit,
        cost_price: productData.cost_price,
        sell_price: productData.sell_price,
        is_active: productData.is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async listAll({ limit = 50, offset = 0, search = '', categoryId = null, isActive = null, sortBy = 'name', sortOrder = 'asc' }) {
    let query = supabase
      .from('products')
      .select('*, category:categories(id, name, key)', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, total: count };
  }
}

module.exports = new ProductRepository();
