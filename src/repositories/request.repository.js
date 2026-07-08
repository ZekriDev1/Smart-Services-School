/**
 * SMARTSERVICES Schools - Request Repository
 */

const { supabase } = require('../config/db');

class RequestRepository {
  async findById(id) {
    const { data, error } = await supabase
      .from('requests')
      .select('*, items:request_items(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async listAll({ limit = 50, offset = 0, status = null, search = '' }, userId = null, role = 'user') {
    let query = supabase
      .from('requests')
      .select('*', { count: 'exact' });

    // Filter by user unless admin/superadmin
    if (role === 'user' && userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`school_name.ilike.%${search}%,request_number.ilike.%${search}%,service_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, total: count };
  }

  async create(requestData, userId) {
    // 1. Insert request header
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert([
        {
          user_id: userId,
          service_key: requestData.service_key,
          service_name: requestData.service_name,
          school_name: requestData.school_name,
          city: requestData.city,
          contact_name: requestData.contact_name,
          contact_phone: requestData.contact_phone,
          contact_email: requestData.contact_email,
          description: requestData.description || '',
          requested_date: requestData.requested_date || null,
          budget: requestData.budget || null,
          quantity: requestData.quantity || null,
          priority: requestData.priority || 'normal',
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (requestError) throw requestError;

    // 2. Insert items if provided
    if (requestData.items && Array.isArray(requestData.items) && requestData.items.length > 0) {
      const itemsToInsert = requestData.items.map(item => ({
        request_id: request.id,
        item_type: item.item_type || '',
        item_name: item.item_name || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0.00,
        total_price: (item.quantity || 1) * (item.unit_price || 0.00),
        specifications: item.specifications || ''
      }));

      const { error: itemsError } = await supabase
        .from('request_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return this.findById(request.id);
  }

  async updateStatus(id, status, notes = '') {
    const { data, error } = await supabase
      .from('requests')
      .update({
        status,
        notes: notes || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new RequestRepository();
