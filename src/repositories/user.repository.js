/**
 * SMARTSERVICES Schools - User Repository
 */

const { supabase } = require('../config/db');

class UserRepository {
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, school_name, phone, avatar_url, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No record found
      throw error;
    }
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, school_name, phone, avatar_url, created_at')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createProfile(id, profileData) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id,
          email: profileData.email,
          full_name: profileData.fullName || '',
          school_name: profileData.schoolName || '',
          phone: profileData.phone || ''
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(id, profileData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: profileData.fullName,
        school_name: profileData.schoolName,
        phone: profileData.phone,
        avatar_url: profileData.avatarUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listAll(limit = 50, offset = 0, search = '') {
    let query = supabase
      .from('users')
      .select('id, email, full_name, school_name, phone, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,school_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, total: count };
  }
}

module.exports = new UserRepository();
