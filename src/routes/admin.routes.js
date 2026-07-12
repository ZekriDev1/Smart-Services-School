/**
 * SMARTSERVICES Schools - Admin API Routes
 * All endpoints prefixed with /api/admin
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { requireAuth } = require('../middlewares/auth');
const logger = require('../utils/logger');

// ==========================================
// HARDCODED ADMIN LOGIN (from .env)
// ==========================================
router.post('/login', express.json(), (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartservices.ma';
  const adminPassword = process.env.ADMIN_PASSWORD || 'G1235678 ';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  if (email === adminEmail && password === adminPassword) {
    return res.json({
      success: true,
      user: {
        id: 'admin-hardcoded',
        email: adminEmail,
        full_name: adminName,
        role: 'admin',
        account_status: 'active'
      }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// ==========================================
// MIDDLEWARE: Verify admin role with role-based access
// ==========================================
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role, account_status')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'User profile not found' });
    }

    if (user.account_status === 'suspended' || user.account_status === 'archived') {
      return res.status(403).json({ success: false, error: 'Account is suspended' });
    }

    const adminRoles = ['super_admin', 'sales_manager', 'operations_manager', 'support_agent', 'technician', 'account_manager'];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    logger.error('Admin middleware error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// ==========================================
// DASHBOARD STATS
// ==========================================
router.get('/dashboard/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parallel queries for dashboard stats
    const [
      totalUsersResult,
      totalRequestsResult,
      pendingResult,
      inProgressResult,
      completedResult,
      invoicesResult,
      quotesResult,
      newUsersResult,
      activeSchoolsResult,
      servicesResult,
      citiesResult,
      monthlyRequestsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('requests').select('id', { count: 'exact', head: true }),
      supabase.from('requests').select('id', { count: 'exact', head: true }).in('status', ['pending', 'nouvelle_demande', 'en_attente', 'review']),
      supabase.from('requests').select('id', { count: 'exact', head: true }).in('status', ['in_progress', 'en_preparation', 'prestataire_assigne', 'en_cours']),
      supabase.from('requests').select('id', { count: 'exact', head: true }).in('status', ['completed', 'termine', 'livre']),
      supabase.from('invoices').select('total_amount'),
      supabase.from('quotes').select('status', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('requests').select('school_name', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
      supabase.from('requests').select('service_key, service_name'),
      supabase.from('requests').select('city'),
      supabase.from('requests').select('created_at').gte('created_at', monthStart.toISOString())
    ]);

    // Calculate total revenue
    let totalRevenue = 0;
    if (invoicesResult.data) {
      invoicesResult.data.forEach(inv => {
        totalRevenue += Number(inv.total_amount) || 0;
      });
    }

    // Quote stats
    let quotesSent = 0, quotesAccepted = 0, quotesRejected = 0;
    if (quotesResult.data) {
      quotesSent = quotesResult.count || 0;
    }

    const { data: acceptedQuotes } = await supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'accepted');
    const { data: rejectedQuotes } = await supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'rejected');
    quotesAccepted = acceptedQuotes?.count || 0;
    quotesRejected = rejectedQuotes?.count || 0;

    // Most requested service
    let mostRequestedService = 'N/A';
    if (servicesResult.data && servicesResult.data.length > 0) {
      const serviceCounts = {};
      servicesResult.data.forEach(r => {
        const key = r.service_name || r.service_key || 'unknown';
        serviceCounts[key] = (serviceCounts[key] || 0) + 1;
      });
      let maxCount = 0;
      Object.entries(serviceCounts).forEach(([name, count]) => {
        if (count > maxCount) { maxCount = count; mostRequestedService = name; }
      });
    }

    // Requests by city
    const cityCounts = {};
    if (citiesResult.data) {
      citiesResult.data.forEach(r => {
        const city = r.city || 'Inconnue';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
    }

    // Requests by service
    const serviceCounts = {};
    if (servicesResult.data) {
      servicesResult.data.forEach(r => {
        const key = r.service_name || r.service_key || 'unknown';
        serviceCounts[key] = (serviceCounts[key] || 0) + 1;
      });
    }

    // Monthly requests chart
    const monthlyData = {};
    if (monthlyRequestsResult.data) {
      monthlyRequestsResult.data.forEach(r => {
        const date = new Date(r.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });
    }

    // Average response time (simplified: time from creation to status change)
    let avgResponseTime = 'N/A';
    const { data: completedRequests } = await supabase
      .from('requests')
      .select('created_at, updated_at')
      .in('status', ['completed', 'termine', 'livre'])
      .not('updated_at', 'is', null);
    
    if (completedRequests && completedRequests.length > 0) {
      let totalDays = 0;
      completedRequests.forEach(r => {
        const created = new Date(r.created_at);
        const updated = new Date(r.updated_at);
        const diffDays = (updated - created) / (1000 * 60 * 60 * 24);
        totalDays += diffDays;
      });
      avgResponseTime = (totalDays / completedRequests.length).toFixed(1) + ' jours';
    }

    // School count (unique)
    const { count: schoolCount } = await supabase
      .from('requests')
      .select('school_name', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        totalUsers: totalUsersResult.count || 0,
        totalSchools: schoolCount || 0,
        totalRequests: totalRequestsResult.count || 0,
        pendingRequests: pendingResult.count || 0,
        inProgressRequests: inProgressResult.count || 0,
        completedRequests: completedResult.count || 0,
        totalRevenue: totalRevenue,
        quotesSent,
        quotesAccepted,
        quotesRejected,
        newUsersThisWeek: newUsersResult.count || 0,
        mostRequestedService,
        activeSchoolsThisMonth: activeSchoolsResult.count || 0,
        averageResponseTime: avgResponseTime,
        requestsByCity: cityCounts,
        requestsByService: serviceCounts,
        monthlyRequests: monthlyData
      }
    });
  } catch (err) {
    logger.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// USER MANAGEMENT
// ==========================================

// List all users with admin info
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 50 } = req.query;
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,school_name.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('account_status', status);
    }
    if (role) {
      query = query.eq('role', role);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: users, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data: users, count });
  } catch (err) {
    logger.error('List users error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single user with full details
router.get('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [userResult, requestsResult, spendingResult, notesResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', id).single(),
      supabase.from('requests').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('total_amount').eq('user_id', id),
      supabase.from('internal_notes').select('*').eq('entity_type', 'user').eq('entity_id', id).order('created_at', { ascending: false })
    ]);

    if (userResult.error) throw userResult.error;

    let totalSpending = 0;
    if (spendingResult.data) {
      spendingResult.data.forEach(inv => {
        totalSpending += Number(inv.total_amount) || 0;
      });
    }

    res.json({
      success: true,
      data: {
        ...userResult.data,
        requests: requestsResult.data || [],
        total_spending: totalSpending,
        notes: notesResult.data || []
      }
    });
  } catch (err) {
    logger.error('Get user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user
router.put('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, school_name, role, account_status, assigned_manager, address, secondary_phone, school_logo } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (school_name !== undefined) updates.school_name = school_name;
    if (role !== undefined) updates.role = role;
    if (account_status !== undefined) updates.account_status = account_status;
    if (assigned_manager !== undefined) updates.assigned_manager = assigned_manager;
    if (address !== undefined) updates.address = address;
    if (secondary_phone !== undefined) updates.secondary_phone = secondary_phone;
    if (school_logo !== undefined) updates.school_logo = school_logo;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: id,
      admin_id: req.user.id,
      action_type: 'user_modification',
      entity_type: 'user',
      entity_id: id,
      new_value: updates,
      description: `User ${id} updated by ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Update user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Suspend user
router.post('/users/:id/suspend', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: oldUser } = await supabase.from('users').select('account_status').eq('id', id).single();

    const { data, error } = await supabase
      .from('users')
      .update({ account_status: 'suspended' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: id,
      admin_id: req.user.id,
      action_type: 'user_suspend',
      entity_type: 'user',
      entity_id: id,
      old_value: { account_status: oldUser?.account_status },
      new_value: { account_status: 'suspended' },
      description: `User ${id} suspended by ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Suspend user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reactivate user
router.post('/users/:id/reactivate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: oldUser } = await supabase.from('users').select('account_status').eq('id', id).single();

    const { data, error } = await supabase
      .from('users')
      .update({ account_status: 'active' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: id,
      admin_id: req.user.id,
      action_type: 'user_activate',
      entity_type: 'user',
      entity_id: id,
      old_value: { account_status: oldUser?.account_status },
      new_value: { account_status: 'active' },
      description: `User ${id} reactivated by ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Reactivate user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete user
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: id,
      admin_id: req.user.id,
      action_type: 'user_modification',
      entity_type: 'user',
      entity_id: id,
      description: `User ${id} deleted by ${req.user.email}`
    });

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    logger.error('Delete user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset user password (via Supabase Admin API)
router.post('/users/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user } = await supabase.from('users').select('email').eq('id', id).single();
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Send password reset email via Supabase Auth
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: user.email
    });

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: id,
      admin_id: req.user.id,
      action_type: 'user_modification',
      entity_type: 'user',
      entity_id: id,
      description: `Password reset initiated for user ${id} by ${req.user.email}`
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// REQUEST MANAGEMENT
// ==========================================

// List all requests with filters
router.get('/requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, service, city, employee, priority, page = 1, limit = 50 } = req.query;
    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (service) query = query.eq('service_key', service);
    if (city) query = query.ilike('city', `%${city}%`);
    if (employee) query = query.eq('assigned_employee', employee);
    if (priority) query = query.eq('priority', priority);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: requests, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data: requests, count });
  } catch (err) {
    logger.error('List requests error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single request with full details
router.get('/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [requestResult, quotesResult, documentsResult, notesResult, eventsResult] = await Promise.all([
      supabase.from('requests').select('*').eq('id', id).single(),
      supabase.from('quotes').select('*').eq('request_id', id).order('version', { ascending: false }),
      supabase.from('documents').select('*').eq('request_id', id).order('created_at', { ascending: false }),
      supabase.from('internal_notes').select('*, author:author_id(full_name, email)').eq('entity_type', 'request').eq('entity_id', id).order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').eq('request_id', id).order('start_date', { ascending: true })
    ]);

    if (requestResult.error) throw requestResult.error;

    res.json({
      success: true,
      data: {
        ...requestResult.data,
        quotes: quotesResult.data || [],
        documents: documentsResult.data || [],
        notes: notesResult.data || [],
        events: eventsResult.data || []
      }
    });
  } catch (err) {
    logger.error('Get request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update request
router.put('/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assigned_employee, estimated_completion_date, quote_amount, payment_status, supplier_id, supplier_name, description, notes, contact_name, contact_phone, contact_email, school_name, city } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assigned_employee !== undefined) updates.assigned_employee = assigned_employee;
    if (estimated_completion_date !== undefined) updates.estimated_completion_date = estimated_completion_date;
    if (quote_amount !== undefined) updates.quote_amount = quote_amount;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (supplier_id !== undefined) updates.supplier_id = supplier_id;
    if (supplier_name !== undefined) updates.supplier_name = supplier_name;
    if (description !== undefined) updates.description = description;
    if (notes !== undefined) updates.notes = notes;
    if (contact_name !== undefined) updates.contact_name = contact_name;
    if (contact_phone !== undefined) updates.contact_phone = contact_phone;
    if (contact_email !== undefined) updates.contact_email = contact_email;
    if (school_name !== undefined) updates.school_name = school_name;
    if (city !== undefined) updates.city = city;

    // Get old values for logging
    const { data: oldRequest } = await supabase.from('requests').select('*').eq('id', id).single();

    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for status change
    if (status && status !== oldRequest?.status) {
      const statusLabels = {
        'nouvelle_demande': 'Nouvelle demande', 'en_attente': 'En attente',
        'devis_envoye': 'Devis envoyé', 'devis_accepte': 'Devis accepté',
        'devis_refuse': 'Devis refusé', 'en_preparation': 'En préparation',
        'prestataire_assigne': 'Prestataire assigné', 'en_cours': 'En cours',
        'livre': 'Livré', 'termine': 'Terminé', 'annule': 'Annulé'
      };

      if (data.user_id) {
        await supabase.from('notifications').insert({
          user_id: data.user_id,
          type: 'status_change',
          title: 'Statut de votre demande mis à jour',
          message: `Votre demande "${data.service_name}" est maintenant : ${statusLabels[status] || status}`,
          data: { request_id: id, old_status: oldRequest?.status, new_status: status }
        });
      }

      await supabase.from('activity_logs').insert({
        admin_id: req.user.id,
        action_type: 'status_change',
        entity_type: 'request',
        entity_id: id,
        old_value: { status: oldRequest?.status },
        new_value: { status },
        description: `Request ${id} status changed from ${oldRequest?.status} to ${status} by ${req.user.email}`
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Update request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete request
router.delete('/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('activity_logs').insert({
      admin_id: req.user.id,
      action_type: 'request_delete',
      entity_type: 'request',
      entity_id: id,
      description: `Request ${id} deleted by ${req.user.email}`
    });

    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    logger.error('Delete request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// QUOTES MANAGEMENT
// ==========================================

// List quotes for a request
router.get('/quotes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { request_id, page = 1, limit = 50 } = req.query;
    let query = supabase
      .from('quotes')
      .select('*, request:request_id(service_name, school_name, contact_name)')
      .order('created_at', { ascending: false });

    if (request_id) query = query.eq('request_id', request_id);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, count });
  } catch (err) {
    logger.error('List quotes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create quote
router.post('/quotes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { request_id, subtotal, tax, discount, delivery_fee, valid_until, payment_terms, notes } = req.body;

    if (!request_id || subtotal === undefined) {
      return res.status(400).json({ success: false, error: 'request_id and subtotal are required' });
    }

    const total = Number(subtotal) + Number(tax || 0) - Number(discount || 0) + Number(delivery_fee || 0);

    // Check for existing versions
    const { data: existingQuotes } = await supabase
      .from('quotes')
      .select('version')
      .eq('request_id', request_id)
      .order('version', { ascending: false })
      .limit(1);

    const version = (existingQuotes && existingQuotes.length > 0) ? existingQuotes[0].version + 1 : 1;

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        request_id,
        version,
        subtotal,
        tax: tax || 0,
        discount: discount || 0,
        delivery_fee: delivery_fee || 0,
        total,
        valid_until,
        payment_terms,
        notes,
        status: 'draft',
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Update request with quote amount
    await supabase.from('requests').update({ quote_amount: total }).eq('id', request_id);

    await supabase.from('activity_logs').insert({
      admin_id: req.user.id,
      action_type: 'quote_creation',
      entity_type: 'request',
      entity_id: request_id,
      new_value: { total, version },
      description: `Quote v${version} created for request ${request_id} by ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Create quote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update quote
router.put('/quotes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subtotal, tax, discount, delivery_fee, valid_until, payment_terms, notes, status } = req.body;

    const updates = {};
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (tax !== undefined) updates.tax = tax;
    if (discount !== undefined) updates.discount = discount;
    if (delivery_fee !== undefined) updates.delivery_fee = delivery_fee;
    if (valid_until !== undefined) updates.valid_until = valid_until;
    if (payment_terms !== undefined) updates.payment_terms = payment_terms;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    // Recalculate total if financial fields changed
    if (subtotal !== undefined || tax !== undefined || discount !== undefined || delivery_fee !== undefined) {
      const { data: currentQuote } = await supabase.from('quotes').select('*').eq('id', id).single();
      const newSubtotal = subtotal ?? currentQuote.subtotal;
      const newTax = tax ?? currentQuote.tax;
      const newDiscount = discount ?? currentQuote.discount;
      const newDelivery = delivery_fee ?? currentQuote.delivery_fee;
      updates.total = Number(newSubtotal) + Number(newTax) - Number(newDiscount) + Number(newDelivery);
    }

    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      admin_id: req.user.id,
      action_type: 'quote_update',
      entity_type: 'quote',
      entity_id: id,
      new_value: updates,
      description: `Quote ${id} updated by ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Update quote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send quote (change status to sent)
router.post('/quotes/:id/send', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: quote } = await supabase.from('quotes').select('*, request:request_id(*)').eq('id', id).single();
    if (!quote) return res.status(404).json({ success: false, error: 'Quote not found' });

    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'sent' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update request status
    await supabase.from('requests').update({ status: 'devis_envoye' }).eq('id', quote.request_id);

    // Notify user
    if (quote.request?.user_id) {
      await supabase.from('notifications').insert({
        user_id: quote.request.user_id,
        type: 'quote_available',
        title: 'Devis disponible',
        message: `Un devis de ${quote.total} MAD est disponible pour votre demande "${quote.request.service_name}"`,
        data: { quote_id: id, request_id: quote.request_id, amount: quote.total }
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Send quote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Accept quote
router.post('/quotes/:id/accept', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: quote } = await supabase.from('quotes').select('*, request:request_id(*)').eq('id', id).single();
    if (!quote) return res.status(404).json({ success: false, error: 'Quote not found' });

    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('requests').update({ status: 'devis_accepte', quote_amount: quote.total }).eq('id', quote.request_id);

    await supabase.from('activity_logs').insert({
      admin_id: req.user.id,
      action_type: 'quote_creation',
      entity_type: 'quote',
      entity_id: id,
      description: `Quote ${id} accepted by admin ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Accept quote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reject quote
router.post('/quotes/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: quote } = await supabase.from('quotes').select('*, request:request_id(*)').eq('id', id).single();
    if (!quote) return res.status(404).json({ success: false, error: 'Quote not found' });

    const { data, error } = await supabase
      .from('quotes')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('requests').update({ status: 'devis_refuse' }).eq('id', quote.request_id);

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Reject quote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// NOTIFICATIONS
// ==========================================

// Get notifications
router.get('/notifications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [adminNotifications, unreadCount] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
    ]);

    res.json({
      success: true,
      data: adminNotifications.data || [],
      unreadCount: unreadCount.count || 0
    });
  } catch (err) {
    logger.error('Notifications error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ACTIVITY LOGS
// ==========================================
router.get('/activity-logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { action_type, page = 1, limit = 50 } = req.query;
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (action_type) query = query.eq('action_type', action_type);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SUPPLIERS
// ==========================================

// List suppliers
router.get('/suppliers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let query = supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create supplier
router.post('/suppliers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, service_categories, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Supplier name is required' });

    const { data, error } = await supabase
      .from('suppliers')
      .insert({ name, contact_person, email, phone, address, city, service_categories: service_categories || [], notes })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update supplier
router.put('/suppliers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('suppliers').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete supplier
router.delete('/suppliers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// DOCUMENTS / FILE MANAGEMENT
// ==========================================

// Upload document (URL already stored in DB after upload to Supabase Storage)
router.post('/documents', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { request_id, user_id, category, file_name, file_type, file_size, storage_path, public_url } = req.body;
    
    if (!category || !file_name || !storage_path) {
      return res.status(400).json({ success: false, error: 'category, file_name, and storage_path are required' });
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        request_id: request_id || null,
        user_id: user_id || null,
        category,
        file_name,
        file_type: file_type || 'unknown',
        file_size: file_size || 0,
        storage_path,
        public_url: public_url || '',
        uploaded_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      admin_id: req.user.id,
      action_type: 'file_upload',
      entity_type: 'document',
      entity_id: data.id,
      description: `File "${file_name}" uploaded by ${req.user.email}`
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get documents for a request
router.get('/documents', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { request_id, category } = req.query;
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (request_id) query = query.eq('request_id', request_id);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete document
router.delete('/documents/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// INTERNAL NOTES
// ==========================================

// Add note
router.post('/notes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { entity_type, entity_id, note, is_private } = req.body;
    if (!entity_type || !entity_id || !note) {
      return res.status(400).json({ success: false, error: 'entity_type, entity_id, and note are required' });
    }

    const { data, error } = await supabase
      .from('internal_notes')
      .insert({
        entity_type,
        entity_id,
        note,
        author_id: req.user.id,
        is_private: is_private !== false
      })
      .select('*, author:author_id(full_name, email)')
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get notes for entity
router.get('/notes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;
    if (!entity_type || !entity_id) {
      return res.status(400).json({ success: false, error: 'entity_type and entity_id are required' });
    }

    const { data, error } = await supabase
      .from('internal_notes')
      .select('*, author:author_id(full_name, email)')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// CALENDAR EVENTS
// ==========================================

// Get calendar events
router.get('/calendar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = supabase.from('calendar_events').select('*, request:request_id(service_name, school_name)').order('start_date', { ascending: true });

    if (start) query = query.gte('start_date', start);
    if (end) query = query.lte('end_date', end);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create calendar event
router.post('/calendar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { request_id, title, description, event_type, start_date, end_date, all_day, location, assigned_to, color } = req.body;
    if (!title || !start_date) {
      return res.status(400).json({ success: false, error: 'title and start_date are required' });
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        request_id, title, description, event_type, start_date, end_date,
        all_day: all_day || false, location, assigned_to,
        color: color || '#ff6b00', created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update calendar event
router.put('/calendar/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('calendar_events').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete calendar event
router.delete('/calendar/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ANALYTICS
// ==========================================
router.get('/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    const [revenueData, requestsData, servicesData, citiesData, conversionData, avgValueData] = await Promise.all([
      supabase.from('invoices').select('total_amount, created_at').gte('created_at', yearStart).lte('created_at', yearEnd),
      supabase.from('requests').select('created_at, status').gte('created_at', yearStart).lte('created_at', yearEnd),
      supabase.from('requests').select('service_key, service_name'),
      supabase.from('requests').select('city'),
      supabase.from('requests').select('status'),
      supabase.from('invoices').select('total_amount')
    ]);

    // Revenue by month
    const revenueByMonth = {};
    if (revenueData.data) {
      revenueData.data.forEach(inv => {
        const d = new Date(inv.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(inv.total_amount || 0);
      });
    }

    // Requests by month
    const requestsByMonth = {};
    if (requestsData.data) {
      requestsData.data.forEach(r => {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        requestsByMonth[key] = (requestsByMonth[key] || 0) + 1;
      });
    }

    // Top services
    const serviceCounts = {};
    if (servicesData.data) {
      servicesData.data.forEach(r => {
        const key = r.service_name || r.service_key || 'unknown';
        serviceCounts[key] = (serviceCounts[key] || 0) + 1;
      });
    }
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top cities
    const cityCounts = {};
    if (citiesData.data) {
      citiesData.data.forEach(r => {
        const city = r.city || 'Inconnue';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
    }
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Conversion rate (completed vs total)
    let totalRequests = 0;
    let completedRequests = 0;
    if (conversionData.data) {
      totalRequests = conversionData.data.length;
      completedRequests = conversionData.data.filter(r => 
        ['completed', 'termine', 'livre'].includes(r.status)
      ).length;
    }
    const conversionRate = totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : 0;

    // Average request value
    let totalAmount = 0;
    let invoiceCount = 0;
    if (avgValueData.data) {
      avgValueData.data.forEach(inv => {
        totalAmount += Number(inv.total_amount || 0);
        invoiceCount++;
      });
    }
    const avgRequestValue = invoiceCount > 0 ? (totalAmount / invoiceCount).toFixed(2) : 0;

    // Most active schools
    const { data: schoolData } = await supabase
      .from('requests')
      .select('school_name')
      .gte('created_at', yearStart);

    const schoolCounts = {};
    if (schoolData) {
      schoolData.forEach(r => {
        const school = r.school_name || 'Inconnu';
        schoolCounts[school] = (schoolCounts[school] || 0) + 1;
      });
    }
    const topSchools = Object.entries(schoolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        revenueByMonth,
        requestsByMonth,
        topServices,
        topCities,
        topSchools,
        conversionRate: Number(conversionRate),
        averageRequestValue: Number(avgRequestValue),
        totalRevenue: totalAmount,
        totalRequests,
        completedRequests
      }
    });
  } catch (err) {
    logger.error('Analytics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// EXPORT
// ==========================================
router.get('/export/:type', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data;
    switch (type) {
      case 'users':
        data = (await supabase.from('users').select('*')).data;
        break;
      case 'requests':
        data = (await supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(1000)).data;
        break;
      case 'invoices':
        data = (await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(1000)).data;
        break;
      case 'quotes':
        data = (await supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(1000)).data;
        break;
      default:
        return res.status(400).json({ success: false, error: `Unknown export type: ${type}` });
    }

    if (!data) data = [];

    if (format === 'csv') {
      if (data.length === 0) return res.json({ success: true, data: [], format: 'csv', csv: '' });
      const headers = Object.keys(data[0]);
      const csvLines = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        });
        csvLines.push(values.join(','));
      });
      return res.json({ success: true, data, format: 'csv', csv: csvLines.join('\n') });
    }

    res.json({ success: true, data, format: 'json' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ROLES
// ==========================================
router.get('/roles', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('roles').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;