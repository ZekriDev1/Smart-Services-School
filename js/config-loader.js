/**
 * SMARTSERVICES Schools - Configuration Loader
 * ============================================
 * Loads Supabase configuration from the server /api/config endpoint.
 * Falls back to inline config if server is unavailable.
 */

(function() {
  const CONFIG_STORAGE_KEY = 'smartschools_config';
  
  /**
   * Load config from server, with localStorage fallback
   */
  async function loadConfig() {
    // Try to load from localStorage first (user-saved config)
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem(CONFIG_STORAGE_KEY);
      }
    }

    // Try to fetch from server /api/config
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        // Save to localStorage for later use
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        return config;
      }
    } catch (e) {
      // Server not available, will use SUPABASE_CONFIG from supabase.js
    }

    // Fallback: return empty config (will try SUPABASE_CONFIG in supabase.js)
    return {};
  }

  /**
   * Save config to localStorage (for when user manually enters credentials)
   */
  function saveConfig(config) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }

  // Make it globally available
  window.__configLoader = {
    load: loadConfig,
    save: saveConfig
  };
})();