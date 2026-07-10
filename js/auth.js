/**
 * SMARTSERVICES Schools - Authentication Module
 * Production-grade auth using Supabase Auth with persistent sessions,
 * automatic token refresh, and secure route protection.
 */

// ===== AUTH STATE =====
let currentUser = null;
let authListeners = [];
let authInitialized = false;
let authPromise = null;

// ===== LOADING SCREEN =====
function showAuthLoadingScreen() {
  // Remove existing loading screen if present
  const existing = document.getElementById('authLoadingScreen');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'authLoadingScreen';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    transition: opacity 0.4s ease;
  `;
  overlay.innerHTML = `
    <div style="width:60px;height:60px;border:4px solid #f3f3f3;border-top:4px solid #ff6b00;border-radius:50%;animation:authSpin 0.8s linear infinite;margin-bottom:24px;"></div>
    <p style="font-family:'Nunito',sans-serif;font-size:1.1rem;font-weight:700;color:#1e293b;">Vérification de votre session...</p>
    <style>
      @keyframes authSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  document.body.appendChild(overlay);
}

function hideAuthLoadingScreen() {
  const overlay = document.getElementById('authLoadingScreen');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 400);
  }
}

// ===== WAIT FOR SUPABASE CLIENT =====
async function ensureSupabaseClient() {
  if (!window.__supabase) {
    throw new Error('Supabase module not loaded');
  }
  let client = window.__supabase.getClient();
  if (!client) {
    client = await window.__supabase.init();
  }
  return client;
}

/**
 * Initialize the auth module — verifies session with Supabase Auth
 * Returns a promise that resolves when auth state is known.
 */
async function initAuth() {
  // Prevent multiple simultaneous initializations
  if (authPromise) return authPromise;

  authPromise = new Promise(async (resolve) => {
    showAuthLoadingScreen();

    try {
      const supabase = await ensureSupabaseClient();

      if (!supabase) {
        // Supabase not configured — allow offline mode with stored session
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
            notifyAuthListeners('login', currentUser);
          } catch (e) {
            localStorage.removeItem('auth_user');
          }
        }
        authInitialized = true;
        hideAuthLoadingScreen();
        resolve(currentUser);
        return;
      }

      // Step 1: Try to restore session from Supabase Auth (handles token refresh automatically)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Session error:', sessionError.message);
      }

      if (session?.user) {
        // Valid session found — fetch the full user profile
        currentUser = session.user;
        localStorage.setItem('auth_user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
          phone: session.user.phone || ''
        }));
        notifyAuthListeners('login', currentUser);
      } else {
        // No valid session — try restoring from local cache as fallback
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser && localStorage.getItem('auth_token')) {
          try {
            currentUser = JSON.parse(storedUser);
            notifyAuthListeners('login', currentUser);
          } catch (e) {
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
      }

      // Step 2: Listen for auth state changes (handles token refresh, logout, etc.)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            currentUser = session.user;
            localStorage.setItem('auth_token', session.access_token);
            localStorage.setItem('auth_user', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
              phone: session.user.phone || ''
            }));
            notifyAuthListeners('login', currentUser);
            updateAuthUI();
          }
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          clearAuthData();
          notifyAuthListeners('logout', null);
          updateAuthUI();
        } else if (event === 'PASSWORD_RECOVERY') {
          // Handle password recovery if needed
        }
      });

      // Store the subscription for cleanup
      window.__authSubscription = subscription;

    } catch (err) {
      console.warn('Auth initialization error:', err.message);
      // Fallback: try cached session
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser && localStorage.getItem('auth_token')) {
        try {
          currentUser = JSON.parse(storedUser);
          notifyAuthListeners('login', currentUser);
        } catch (e) {
          clearAuthData();
        }
      }
    }

    authInitialized = true;
    hideAuthLoadingScreen();
    // Update the navbar once auth state is known
    if (typeof updateAuthUI === 'function') updateAuthUI();
    resolve(currentUser);
  });

  return authPromise;
}

/**
 * Wait for auth to be fully initialized
 */
function waitForAuth() {
  if (authInitialized) return Promise.resolve(currentUser);
  return initAuth();
}

/**
 * Clear all authentication data
 */
function clearAuthData() {
  currentUser = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

/**
 * Sign in with email and password via Supabase Auth
 */
async function signIn(email, password) {
  try {
    const supabase = await ensureSupabaseClient();
    if (!supabase) {
      return { success: false, error: window.I18n ? window.I18n.t('authMessages.supabaseNotConfigured') : 'Supabase n\'est pas configuré.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data?.user) {
      currentUser = data.user;
      localStorage.setItem('auth_token', data.session?.access_token || '');
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
        phone: data.user.phone || ''
      }));
      notifyAuthListeners('login', currentUser);
      return { success: true, user: currentUser };
    }

    return { success: false, error: window.I18n ? window.I18n.t('authMessages.unknownError') : 'Erreur de connexion inconnue.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign up a new user via Supabase Auth
 */
async function signUp(email, password, userData = {}) {
  try {
    const supabase = await ensureSupabaseClient();
    if (!supabase) {
      return { success: false, error: window.I18n ? window.I18n.t('authMessages.supabaseNotConfigured') : 'Supabase n\'est pas configuré.' };
    }

    // First check if user exists by trying to sign in
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // Also check via API to see if user already exists
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const userExists = users?.some(u => u.email === email);

    if (userExists) {
      return { success: false, error: window.I18n ? window.I18n.t('authMessages.emailExists') : 'Un compte avec cet email existe déjà.' };
    }

    // Check if sign-up is enabled
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name || '',
          school_name: userData.school_name || '',
          phone: userData.phone || ''
        }
      }
    });

    if (error) {
      // Check if error is about user already existing
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        return { success: false, error: window.I18n ? window.I18n.t('authMessages.emailExists') : 'Un compte avec cet email existe déjà.' };
      }
      throw error;
    }

    return {
      success: true,
      message: data?.user?.identities?.length === 0
        ? window.I18n ? window.I18n.t('authMessages.emailExists') : 'Un compte avec cet email existe déjà.'
        : window.I18n ? window.I18n.t('authMessages.signupSuccess') : 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Log out the current user via Supabase Auth
 */
async function signOut() {
  try {
    const supabase = await ensureSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.warn('Supabase signOut error:', e.message);
  }

  clearAuthData();
  notifyAuthListeners('logout', null);
  return { success: true };
}

/**
 * Get the current logged-in user
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Check if a user is logged in
 */
function isLoggedIn() {
  return currentUser !== null;
}

/**
 * Register a listener for auth state changes
 */
function onAuthChange(callback) {
  authListeners.push(callback);
  if (currentUser) {
    callback('login', currentUser);
  }
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
}

/**
 * Notify all auth listeners
 */
function notifyAuthListeners(event, user) {
  authListeners.forEach(cb => {
    try { cb(event, user); } catch (e) { /* ignore */ }
  });
}

/**
 * Build the entire auth section of the header dynamically.
 * Replaces any hardcoded auth buttons with JS-generated markup.
 */
function buildAuthNav(container) {
  if (!container) return;
  container.innerHTML = '';

  const isAuth = !!currentUser;

  if (isAuth) {
    const displayName = currentUser.user_metadata?.full_name ||
                        currentUser.full_name ||
                        currentUser.email?.split('@')[0] ||
                        'Utilisateur';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const email = currentUser.email || '';

    container.innerHTML = `
      <div class="auth-user-info" style="display:flex;align-items:center;gap:12px;">
        <div class="user-avatar" style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ff6b00,#ff8c00);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.9rem;flex-shrink:0;" id="userAvatarInitials">${initials}</div>
        <div style="display:flex;flex-direction:column;line-height:1.2;">
          <span style="font-size:0.85rem; font-weight:700; color:var(--secondary);" class="auth-user-name">${displayName}</span>
          <span style="font-size:0.75rem; color:var(--text-light);">${email}</span>
        </div>
      </div>
      <a href="app.html" class="btn btn-primary btn-sm auth-dashboard-btn"><i class="fas fa-th-large"></i> ${window.I18n ? window.I18n.t('app.ourServices') : 'Tableau de bord'}</a>
      <a href="#" class="btn btn-outline btn-sm auth-logout-btn" onclick="event.preventDefault(); handleLogout()"><i class="fas fa-sign-out-alt"></i> ${window.I18n ? window.I18n.t('nav.logout') : 'Déconnexion'}</a>
    `;
  } else {
    container.innerHTML = `
      <a href="#" class="btn btn-outline btn-sm auth-login-btn" onclick="event.preventDefault(); openLoginModal()">${window.I18n ? window.I18n.t('nav.login') : 'Connexion'}</a>
      <a href="#" class="btn btn-primary btn-sm auth-signup-btn" onclick="event.preventDefault(); openSignupModal()">${window.I18n ? window.I18n.t('nav.signup') : 'Créer un compte'}</a>
    `;
  }
}

/**
 * Update UI elements based on auth state
 */
function updateAuthUI() {
  const headerActions = document.getElementById('headerActions');
  // Rebuild the entire auth section based on current user state
  buildAuthNav(headerActions);
}

/**
 * Auth guard for protected pages.
 * Returns a promise that resolves when auth is verified.
 * Redirects to login if not authenticated.
 */
async function requireAuth(redirectUrl = 'index.html') {
  await waitForAuth();

  if (!currentUser) {
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

/**
 * Redirect authenticated users away from login/signup pages
 */
async function redirectIfAuthenticated(targetUrl = 'app.html') {
  await waitForAuth();

  if (currentUser) {
    window.location.href = targetUrl;
    return true;
  }
  return false;
}

// ===== MODAL FUNCTIONS =====

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function openSignupModal() {
  closeLoginModal();
  const modal = document.getElementById('signupModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSignupModal() {
  const modal = document.getElementById('signupModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function switchToSignup() {
  closeLoginModal();
  openSignupModal();
}

function switchToLogin() {
  closeSignupModal();
  openLoginModal();
}

// ===== FORM HANDLERS =====

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  btn.disabled = true;

  const result = await signIn(email, password);

  btn.innerHTML = originalText;
  btn.disabled = false;

  if (result?.success) {
    showAuthSuccess('Connexion réussie !');
    closeLoginModal();
    updateAuthUI();
    // User stays on current page — no automatic redirect
  } else if (result?.error) {
    showAuthError(result.error);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const fullName = document.getElementById('signupFullName').value.trim();
  const schoolName = document.getElementById('signupSchoolName').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  if (password !== confirmPassword) {
    showAuthError(window.I18n ? window.I18n.t('authMessages.passMismatch') : 'Les mots de passe ne correspondent pas.');
    return;
  }

  if (password.length < 6) {
    showAuthError(window.I18n ? window.I18n.t('authMessages.passLength') : 'Le mot de passe doit contenir au moins 6 caractères.');
    return;
  }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
  btn.disabled = true;

  const result = await signUp(email, password, {
    full_name: fullName,
    school_name: schoolName,
    phone: phone
  });

  btn.innerHTML = originalText;
  btn.disabled = false;

  if (result?.success) {
    showAuthSuccess(result.message || 'Inscription réussie !');
    closeSignupModal();
    switchToLogin();
  } else if (result?.error) {
    showAuthError(result.error);
  }
}

async function handleLogout() {
  const result = await signOut();
  if (result?.success) {
    updateAuthUI();
    if (window.location.pathname.includes('app.html')) {
      window.location.href = 'index.html';
    }
  } else if (result?.error) {
    showAuthError(result.error);
  }
}

/**
 * Show auth error message
 */
function showAuthError(message) {
  const modal = document.getElementById('authMessageModal');
  const text = document.getElementById('authMessageText');
  if (modal && text) {
    text.textContent = message;
    modal.classList.add('open');
    setTimeout(() => modal.classList.remove('open'), 4000);
  } else {
    alert(message);
  }
}

/**
 * Show auth success message
 */
function showAuthSuccess(message) {
  const modal = document.getElementById('authMessageModal');
  const text = document.getElementById('authMessageText');
  const icon = modal?.querySelector('.auth-message-icon');
  if (modal && text) {
    text.textContent = message;
    if (icon) {
      icon.className = 'auth-message-icon fas fa-check-circle';
      icon.style.color = '#10b981';
    }
    modal.classList.add('open');
    setTimeout(() => modal.classList.remove('open'), 4000);
  } else {
    alert(message);
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {

  

  window.openLoginModal = openLoginModal;
  window.closeLoginModal = closeLoginModal;
  window.openSignupModal = openSignupModal;
  window.closeSignupModal = closeSignupModal;
  window.switchToSignup = switchToSignup;
  window.switchToLogin = switchToLogin;
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.handleLogout = handleLogout;
  window.updateAuthUI = updateAuthUI;

  // Bind logout buttons
  document.querySelectorAll('.auth-logout-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  });

  initAuth();
  
  if (window.__auth?.onAuthChange) {
    window.__auth.onAuthChange((event) => {
      if (event === 'login' || event === 'logout') {
        updateAuthUI();
      }
    });
  }
});

// ===== EXPORTS =====
window.__auth = {
  isLoggedIn,
  getCurrentUser,
  onAuthChange,
  handleLogout,
  initAuth,
  waitForAuth,
  requireAuth,
  redirectIfAuthenticated
};