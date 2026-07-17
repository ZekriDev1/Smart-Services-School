/**
 * SMARTSERVICES Schools - Configuration Loader
 * ============================================
 * Loads Supabase configuration from localStorage (user-saved)
 * or falls back to the hardcoded SUPABASE_CONFIG in supabase.js.
 */

(function() {
  const CONFIG_STORAGE_KEY = 'smartschools_config';
  
  /**
   * Load config from localStorage fallback
   */
  async function loadConfig() {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem(CONFIG_STORAGE_KEY);
      }
    }
    return {};
  }

  /**
   * Save config to localStorage (for when user manually enters credentials)
   */
  function saveConfig(config) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }

  window.__configLoader = {
    load: loadConfig,
    save: saveConfig
  };
})();