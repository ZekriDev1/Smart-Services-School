/**
 * SMARTSERVICES Schools - Invoice Repository
 */

const { supabase } = require('../config/db');

class InvoiceRepository {
  async findById(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async listAll({ limit = 50, offset = 0, status = null }, userId = null, role = 'user') {
    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' });

    if (role === 'user' && userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, total: count };
  }

  async create(invoiceData) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          request_id: invoiceData.request_id || null,
          user_id: invoiceData.user_id,
          service_name: invoiceData.service_name,
          amount: invoiceData.amount,
          tax: invoiceData.tax || 0.00,
          total_amount: invoiceData.total_amount,
          currency: invoiceData.currency || 'MAD',
          status: invoiceData.status || 'pending',
          payment_method: invoiceData.payment_method || null,
          due_date: invoiceData.due_date || null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new InvoiceRepository();
