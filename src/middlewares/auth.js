/**
 * SMARTSERVICES Schools - Auth Middleware
 */

const { supabase } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Middleware: Verify user JWT token and load session
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Validate JWT via Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    }

    // Load profile from DB
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, school_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.warn(`Auth user ${user.id} has no public profile.`);
      req.user = {
        id: user.id,
        email: user.email
      };
    } else {
      req.user = profile;
    }

    next();
  } catch (err) {
    logger.error('Authentication middleware error:', err);
    return res.status(500).json({ success: false, error: 'Internal server authentication error' });
  }
}

module.exports = {
  requireAuth
};
