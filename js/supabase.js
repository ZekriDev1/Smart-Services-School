/**
 * SMARTSERVICES Schools - Supabase Client
 * ============================================
 * 
 * HOW TO CONFIGURE:
 * 
 * Option 1 (Recommended): Edit the SUPABASE_CONFIG object below
 *   with your Supabase project credentials.
 * 
 * Option 2: Use a .env file + node server.js
 *   - Edit .env with your credentials
 *   - Run: node server.js
 *   - Visit: http://localhost:3000
 * 
 * Where to find your credentials:
 *   Supabase Dashboard → Project Settings → API
 *   - Project URL → SUPABASE_CONFIG.url
 *   - anon/public key → SUPABASE_CONFIG.anonKey
 * 
 * *Note: If opening directly as file://, enter credentials in SUPABASE_CONFIG below.
 * ============================================
 */

// ===== CONFIGURATION =====
// Option A: Edit these values if opening file:// directly
const SUPABASE_CONFIG = {
  url: 'https://rsriyrvkizgnhvgsosgk.supabase.co',     // e.g. "https://abc123.supabase.co"
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcml5cnZraXpnbmh2Z3Nvc2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzcxMjMsImV4cCI6MjA5ODkxMzEyM30.QkRn1oqI7UdDbi6LdJWlU8xrZXdFz7sqXxLqmxaUBy0'  // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

// Check if running in a browser environment
let supabaseClient = null;

/**
 * Initialize the Supabase client
 * Call this once when the app starts
 */
async function initSupabase() {
  if (supabaseClient) return supabaseClient;

  let config = SUPABASE_CONFIG;
  
  if (window.__configLoader) {
    const loaded = await window.__configLoader.load();
    if (loaded && loaded.url && loaded.anonKey) {
      config = loaded;
    }
  }
  
  if (!config.url || !config.anonKey) {
    console.warn(
      ' Supabase not configured.\n' +
      'To fix this:\n' +
      '1. Edit js/supabase.js and set SUPABASE_CONFIG.url and SUPABASE_CONFIG.anonKey\n' +
      'OR\n' +
      '2. Create a .env file with SUPABASE_URL and SUPABASE_ANON_KEY\n' +
      '   Then run: node server.js and visit http://localhost:3000\n\n' +
      'Find your credentials at: Supabase Dashboard → Settings → API'
    );
    return null;
  }

  try {
    // Try loading Supabase via script tag for UMD build
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = () => {
        if (window.supabase && window.supabase.createClient) {
          supabaseClient = window.supabase.createClient(config.url, config.anonKey);
          resolve(supabaseClient);
        } else {
          console.error('Supabase not available globally');
          resolve(null);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Supabase script');
        resolve(null);
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
  return supabaseClient;
}

/**
 * Load Supabase configuration
 * Priority: hardcoded config > .env (not available in browser directly)
 */
async function loadSupabaseConfig() {
  return SUPABASE_CONFIG;
}

/**
 * Get the Supabase client instance
 */
function getSupabase() {
  return supabaseClient;
}

// Export for use in other scripts
window.__supabase = {
  init: initSupabase,
  getClient: getSupabase
};