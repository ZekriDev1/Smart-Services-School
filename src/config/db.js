/**
 * SMARTSERVICES Schools - Database & Client Config
 */

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const logger = require('../utils/logger');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  logger.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY not set in environment.');
}

// Initialize Supabase Client.
// Use service role key if available for server-side operations (bypasses RLS), fallback to anon key.
const supabaseAdminKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, supabaseAdminKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

logger.info(`Supabase client initialized with URL: ${SUPABASE_URL}`);

// Initialize PG Connection Pool if DATABASE_URL is configured
let pool = null;
if (DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    logger.info('✅ PostgreSQL direct connection pool initialized successfully.');
  } catch (err) {
    logger.error('Failed to initialize PostgreSQL pool:', err);
  }
} else {
  logger.info('ℹ️ DATABASE_URL not set. Running database operations through Supabase JS API client.');
}

/**
 * Execute raw database query (only available if direct PG pool is configured)
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('Direct PostgreSQL queries not available: DATABASE_URL is not set.');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query: ${text} (${duration}ms)`);
    return res;
  } catch (error) {
    logger.error(`Database Query Error: ${text}`, error);
    throw error;
  }
}

module.exports = {
  supabase,
  query,
  hasDirectDb: () => pool !== null
};
