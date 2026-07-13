/**
 * SMARTSERVICES Schools - Premium Admin Dashboard
 * Enterprise-grade administration panel
 * ============================================
 */

function __(key) {
  if (window.I18n && typeof window.I18n.t === 'function') return window.I18n.t(key);
  return key.split('.').pop().replace(/_/g, ' ');
}

let _labelTablesRaf;
function labelTables() {
  document.querySelectorAll('.table-wrapper table').forEach(table => {
    const ths = table.querySelectorAll('thead th');
    table.querySelectorAll('tbody tr').forEach(tr => {
      tr.querySelectorAll('td').forEach((td, i) => {
        if (ths[i] && !td.hasAttribute('data-label')) {
          td.setAttribute('data-label', ths[i].textContent.trim());
        }
      });
    });
  });
}

// ===== STATE =====
const STATE = {
  user: null,
  users: [],
  requests: [],
  documents: [],
  quotations: [],
  services: [],
  notifications: [],
  activityLogs: [],
  currentPage: { users: 1, requests: 1, quotations: 1 },
  currentTab: 'dashboard',
  filters: { users: '', requests: '', status: '', priority: '', service: '' },
  sort: { field: 'created_at', direction: 'desc' },
  selectedItems: [],
  isLoading: false
};

// ===== SUPABASE CLIENT =====
let _supabase = null;
let _supabaseAdmin = null;

const SUPABASE_URL = 'https://rsriyrvkizgnhvgsosgk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcml5cnZraXpnbmh2Z3Nvc2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzcxMjMsImV4cCI6MjA5ODkxMzEyM30.QkRn1oqI7UdDbi6LdJWlU8xrZXdFz7sqXxLqmxaUBy0';

// IMPORTANT: Get your service_role key from Supabase Dashboard → Project Settings → API
// This is required for admin write operations (delete users, etc.)
// It bypasses Row Level Security, so keep it secure.
const SUPABASE_SERVICE_ROLE_KEY = localStorage.getItem('supabaseServiceKey') || '';

async function getAdminClient() {
  if (_supabaseAdmin) return _supabaseAdmin;
  if (!SUPABASE_SERVICE_ROLE_KEY && !window.supabase?.createClient) return null;
  try {
    if (!window.supabase?.createClient) {
      await new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    _supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
    return _supabaseAdmin;
  } catch(e) {
    console.error('Failed to create admin client:', e);
    return null;
  }
}

async function initSupabase() {
  if (_supabase) return _supabase;

  // Check if Supabase is already loaded (by js/supabase.js or another script)
  if (window.__supabase) {
    const client = window.__supabase.getClient();
    if (client) {
      _supabase = client;
      return _supabase;
    }
    // Client exists as wrapper but not initialized yet - init it
    const initialized = await window.__supabase.init();
    if (initialized) {
      _supabase = initialized;
      return _supabase;
    }
  }

  // If not loaded, load it dynamically
  return new Promise((resolve) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.supabase?.createClient) {
        clearInterval(checkInterval);
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
        resolve(_supabase);
      } else if (attempts > 30) {
        clearInterval(checkInterval);
        resolve(null);
      }
    }, 100);
    
    // Only load script if it's not already loading
    if (!document.querySelector('script[src*="supabase"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onerror = () => { resolve(null); };
      document.head.appendChild(script);
    }
  });
}

// ===== TOAST NOTIFICATIONS =====
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100px)'; setTimeout(() => el.remove(), 300); }, 3000);
}

async function checkAuth() {
  const session = localStorage.getItem('adminSession');
  if (!session) { window.location.href = 'login.html'; return null; }
  
  try {
    const parsed = JSON.parse(session);
    if (parsed.role !== 'admin') { localStorage.removeItem('adminSession'); window.location.href = 'login.html'; return null; }
    STATE.user = parsed;
    return parsed;
  } catch(e) {
    localStorage.removeItem('adminSession');
    window.location.href = 'login.html';
    return null;
  }
}

function updateUserUI(user) {
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');
  const role = document.getElementById('userRole');
  const headerName = document.getElementById('headerUserName');
  
  if (avatar) avatar.textContent = (user.full_name || user.email || 'A').charAt(0).toUpperCase();
  if (name) name.innerHTML = '<i class="fas fa-user-shield"></i>';
  if (role) role.textContent = user.role || 'admin';
  if (headerName) headerName.textContent = (user.full_name || user.email || 'A').charAt(0).toUpperCase();
}

// ===== SIDEBAR =====
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

function navigateTo(tab, el) {
  STATE.currentTab = tab;
  
  // Update sidebar
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (el) el.classList.add('active');
  
  // Show tab content
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  const target = document.getElementById(`${tab}Tab`);
  if (target) target.classList.remove('hidden');
  
  // Close mobile sidebar
  if (window.innerWidth <= 1024) document.querySelector('.sidebar').classList.remove('open');
  
  // Load tab data
  switch(tab) {
    case 'dashboard': loadDashboard(); break;
    case 'requests': loadRequests(); break;
    case 'pending': loadRequests('pending'); break;
    case 'in_progress': loadRequests('in_progress'); break;
    case 'completed': loadRequests('completed'); break;
    case 'cancelled': loadRequests('cancelled'); break;
    case 'users': loadUsers(); break;
    case 'administrators': loadUsers('admin'); break;
    case 'schools': loadUsers('user'); break;
    case 'services': loadServices(); break;
    case 'quotations': loadQuotations(); break;
    case 'analytics': loadAnalytics(); break;
    case 'settings': loadSettings(); break;
    case 'audit': loadAuditLogs(); break;
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const user = await checkAuth();
  if (!user) return;
  
  updateUserUI(user);

  const savedTheme = localStorage.getItem('adminTheme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  
  await initSupabase();
  
  loadDashboard();
  loadNotifications();
  setTimeout(labelTables, 500);

  // Pre-fill service role key input
  var keyInput = document.getElementById('serviceRoleKeyInput');
  var savedKey = localStorage.getItem('supabaseServiceKey');
  if (keyInput && savedKey) keyInput.value = savedKey;

  // Notification toggle
  var notifBtn = document.getElementById('notifBtn');
  var notifMenu = document.getElementById('notifMenu');
  if (notifBtn && notifMenu) {
    notifBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      notifMenu.classList.toggle('open');
      if (notifMenu.classList.contains('open')) loadNotifications();
    });
    document.addEventListener('click', function(e) {
      if (!notifMenu.contains(e.target) && e.target !== notifBtn && !notifBtn.contains(e.target)) {
        notifMenu.classList.remove('open');
      }
    });
  }
});

window.addEventListener('languageChanged', function() {
  const tab = STATE.currentTab || 'dashboard';
  const activeLink = document.querySelector('.sidebar-link.active');
  navigateTo(tab, activeLink);
  setTimeout(labelTables, 300);
  if (window.I18n && window.I18n.applyTranslations) {
    window.I18n.applyTranslations();
  }
});

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    let requests = [], users = [], quotations = [];
    
    // Try backend proxy first (only if running on a server, not file://)
    if (window.location.protocol !== 'file:') {
      try {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const resp = await fetch('/api/admin/panel/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminSession: JSON.parse(adminSession) })
          });
          if (resp.ok) {
            const result = await resp.json();
            if (result.success && result.data) {
              const d = result.data;
              document.getElementById('statTotalRequests').textContent = d.totalRequests;
              document.getElementById('statActiveRequests').textContent = d.inProgress;
              document.getElementById('statCompletedRequests').textContent = d.completed;
              document.getElementById('statTotalUsers').textContent = d.totalUsers;
              document.getElementById('statQuotations').textContent = d.totalQuotations || 0;
              document.getElementById('statRevenue').textContent = `${(d.revenue || 0).toLocaleString()} MAD`;
              const reqs = d.requests || [];
              renderMonthlyChart(reqs);
              renderServiceChart(reqs);
              renderStatusChart(reqs);
              renderRecentActivity(reqs.slice(0, 10));
              return;
            }
          }
        }
      } catch(e) { /* backend not available */ }
    }

    if (!_supabase) await initSupabase();
    await ensureSupabaseSession();
    const [usersRes, requestsRes, quotationsRes] = await Promise.all([
      _supabase.from('users').select('*', { count: 'exact', head: true }),
      _supabase.from('requests').select('*'),
      _supabase.from('quotes').select('*', { count: 'exact', head: true })
    ]);
    
    requests = requestsRes.data || [];
    users = usersRes.data || [];
    quotations = quotationsRes.data || [];
    
    const totalUsers = usersRes.count ?? users.length;
    const totalQuotations = quotationsRes.count ?? quotations.length;
    
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in_progress' || r.status === 'under_review').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const totalRequests = requests.length;
    
    document.getElementById('statTotalRequests').textContent = totalRequests;
    document.getElementById('statActiveRequests').textContent = inProgress;
    document.getElementById('statCompletedRequests').textContent = completed;
    document.getElementById('statTotalUsers').textContent = totalUsers;
    document.getElementById('statQuotations').textContent = totalQuotations;
    
    const revenue = requests.reduce((sum, r) => sum + (Number(r.quote_amount) || 0), 0);
    document.getElementById('statRevenue').textContent = `${revenue.toLocaleString()} MAD`;
    
    renderMonthlyChart(requests);
    
    renderServiceChart(requests);
    
    renderStatusChart(requests);
    
    renderRecentActivity(requests.slice(0, 10));
    
  } catch(e) {
    console.error('Dashboard error:', e);
    toast(__('admin.toast.loadDashboardFailed'), 'error');
  }
}

function renderMonthlyChart(requests) {
  const months = {};
  requests.forEach(r => {
    if (!r.created_at) return;
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    months[key] = (months[key]||0) + 1;
  });
  
  const sorted = Object.entries(months).sort((a,b) => a[0].localeCompare(b[0]));
  const container = document.getElementById('monthlyChart');
  if (!container) return;
  
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>' + __('admin.empty.noData') + '</h3></div>';
    return;
  }
  
  const max = Math.max(...sorted.map(([,v]) => v));
  container.innerHTML = sorted.map(([k,v]) => `
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>${k}</span>
        <span>${v}</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${(v/max)*100}%"></div>
      </div>
    </div>
  `).join('');
}

function renderServiceChart(requests) {
  const services = {};
  requests.forEach(r => {
    const s = r.service_name || r.service_key || 'Other';
    services[s] = (services[s]||0) + 1;
  });
  
  const sorted = Object.entries(services).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const container = document.getElementById('serviceChart');
  if (!container) return;
  
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><h3>' + __('admin.empty.noData') + '</h3></div>';
    return;
  }
  
  const max = Math.max(...sorted.map(([,v]) => v));
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)', '#14b8a6', '#f43f5e'];
  container.innerHTML = sorted.map(([k,v], i) => `
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>${k}</span>
        <span>${v}</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${(v/max)*100}%;background:${colors[i%colors.length]}"></div>
      </div>
    </div>
  `).join('');
}

function renderStatusChart(requests) {
  const statuses = { pending: 0, under_review: 0, in_progress: 0, completed: 0, cancelled: 0 };
  requests.forEach(r => {
    if (statuses[r.status] !== undefined) statuses[r.status]++;
    else statuses.pending++;
  });
  
  const container = document.getElementById('statusChart');
  if (!container) return;
  
  const total = requests.length || 1;
  const labels = { pending: __('admin.requests.pending'), under_review: __('admin.requests.underReview'), in_progress: __('admin.requests.inProgress'), completed: __('admin.requests.completed'), cancelled: __('admin.requests.cancelled') };
  const colors = { pending: 'var(--status-pending)', under_review: 'var(--status-review)', in_progress: 'var(--status-progress)', completed: 'var(--status-completed)', cancelled: 'var(--status-cancelled)' };
  
  container.innerHTML = Object.entries(statuses).map(([k,v]) => `
    <div class="chart-bar-group">
      <div class="chart-bar-label">
        <span>${labels[k] || k}</span>
        <span>${v} (${((v/total)*100).toFixed(1)}%)</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${(v/total)*100}%;background:${colors[k] || '#94a3b8'}"></div>
      </div>
    </div>
  `).join('');
}

function renderRecentActivity(requests) {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  
  if (requests.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><h3>' + __('admin.empty.noActivity') + '</h3></div>';
    return;
  }
  
  container.innerHTML = requests.map(r => {
    const dotColor = r.status === 'completed' ? 'green' : r.status === 'cancelled' ? 'amber' : r.status === 'in_progress' ? 'blue' : 'primary';
    return `
      <div class="activity-item">
        <div class="activity-dot ${dotColor}"></div>
        <div class="activity-content">
          <div class="activity-text">
            <strong>${r.service_name || r.service_key}</strong> - ${r.school_name || 'N/A'}
            <span class="badge badge-${r.status}">${r.status}</span>
          </div>
          <div class="activity-time">${r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== USERS =====
async function loadUsers(roleFilter = '') {
  try {
    STATE.isLoading = true;
    if (!_supabase) await initSupabase();
    if (!_supabase) { STATE.isLoading = false; return; }
    await ensureSupabaseSession();
    let query = _supabase.from('users').select('*').order('created_at', { ascending: false });
    if (roleFilter) query = query.eq('role', roleFilter);
    const { data, error } = await query;
    if (error) throw error;
    
    STATE.users = data || [];
    renderUsersTable(STATE.users);
  } catch(e) {
    console.error('Users error:', e);
    toast(__('admin.toast.loadUsersFailed'), 'error');
  } finally {
    STATE.isLoading = false;
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-users"></i><h3>' + __('admin.empty.noUsers') + '</h3></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = users.map(u => {
    const initials = (u.full_name || u.email || '?').charAt(0).toUpperCase();
    return `<tr>
      <td><div class="flex items-center gap-2"><div class="avatar avatar-sm">${initials}</div><span class="font-semibold">${u.full_name || 'N/A'}</span></div></td>
      <td class="text-muted">${u.email || 'N/A'}</td>
      <td>${u.school_name || '-'}</td>
      <td><span class="badge badge-${u.role === 'admin' ? 'approved' : 'normal'}">${__('admin.users.' + (u.role || 'user'))}</span></td>
      <td><span class="badge badge-${u.account_status || 'active'}">${__('admin.users.' + (u.account_status || 'active'))}</span></td>
      <td class="text-muted text-sm">${u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn-icon btn-icon-view" onclick="viewUser('${u.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-icon-edit" onclick="editUser('${u.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-icon-delete" onclick="deleteUser('${u.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterUsers() {
  const search = (document.getElementById('userSearch')?.value || '').toLowerCase();
  const role = document.getElementById('userRoleFilter')?.value || '';
  const status = document.getElementById('userStatusFilter')?.value || '';
  
  let filtered = STATE.users.filter(u => {
    if (search && !(u.full_name||'').toLowerCase().includes(search) && !(u.email||'').toLowerCase().includes(search)) return false;
    if (role && u.role !== role) return false;
    if (status && u.account_status !== status) return false;
    return true;
  });
  
  renderUsersTable(filtered);
}

async function viewUser(id) {
  const u = STATE.users.find(x => x.id === id);
  if (!u) return;
  
  const userRequests = STATE.requests.filter(r => r.user_id === id);
  const content = `
    <div class="detail-row"><span class="detail-label">${__('admin.modal.fullName')}</span><span class="detail-value">${u.full_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.modal.email')}</span><span class="detail-value">${u.email || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.modal.school')}</span><span class="detail-value">${u.school_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.modal.role')}</span><span class="detail-value">${__('admin.users.' + (u.role || 'user'))}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.modal.status')}</span><span class="detail-value">${__('admin.users.' + (u.account_status || 'active'))}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.dashboard.totalRequests')}</span><span class="detail-value">${userRequests.length}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.joined')}</span><span class="detail-value">${u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.lastLogin')}</span><span class="detail-value">${u.last_login ? new Date(u.last_login).toLocaleDateString() : __('admin.table.never')}</span></div>
  `;
  
  openModal(__('admin.modal.userProfile'), content);
}

async function editUser(id) {
  const u = STATE.users.find(x => x.id === id);
  if (!u) return;
  
  const content = `
    <form id="editUserForm" onsubmit="saveUser(event, '${id}')">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.fullName')}</label>
          <input class="form-input" id="editUserName" value="${u.full_name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.email')}</label>
          <input class="form-input" type="email" id="editUserEmail" value="${u.email || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.school')}</label>
          <input class="form-input" id="editUserSchool" value="${u.school_name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.phone')}</label>
          <input class="form-input" id="editUserPhone" value="${u.phone || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.role')}</label>
          <select class="form-select" id="editUserRole">
            <option value="user" ${u.role==='user'?'selected':''}>${__('admin.users.user')}</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>${__('admin.users.admin')}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.status')}</label>
          <select class="form-select" id="editUserStatus">
            <option value="active" ${u.account_status==='active'?'selected':''}>${__('admin.users.active')}</option>
            <option value="suspended" ${u.account_status==='suspended'?'selected':''}>${__('admin.users.suspended')}</option>
            <option value="archived" ${u.account_status==='archived'?'selected':''}>${__('admin.users.archived')}</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${__('admin.modal.cancel')}</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${__('admin.modal.save')}</button>
      </div>
    </form>
  `;
  
  openModal(__('admin.modal.editUser'), content);
}

async function saveUser(e, id) {
  e.preventDefault();
  const updates = {
    full_name: document.getElementById('editUserName').value,
    email: document.getElementById('editUserEmail').value,
    school_name: document.getElementById('editUserSchool').value,
    phone: document.getElementById('editUserPhone').value,
    role: document.getElementById('editUserRole').value,
    account_status: document.getElementById('editUserStatus').value
  };
  
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    await ensureSupabaseSession();
    const { error } = await _supabase.from('users').update(updates).eq('id', id);
    if (error) throw error;
    toast(__('admin.toast.userUpdated'), 'success');
    closeModal();
    loadUsers();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm(__('admin.toast.deleteUserConfirm'))) return;
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    await ensureSupabaseSession();
    // Try backend API first (if running on a server)
    if (window.location.protocol !== 'file:') {
      try {
        const resp = await fetch('/api/admin/panel/users/' + id, { method: 'DELETE' });
        if (resp.ok) {
          toast(__('admin.toast.userDeleted'), 'success');
          loadUsers();
          return;
        }
      } catch(e) {}
    }
    // Fallback: try admin client (service_role) first since anon key has RLS
    var admin = await getAdminClient();
    if (admin) {
      var { error } = await admin.from('users').delete().eq('id', id);
      if (!error) {
        toast(__('admin.toast.userDeleted'), 'success');
        loadUsers();
        return;
      }
      // If admin client also fails, log it but continue to try anon
      console.warn('Admin delete failed:', error);
    }
    // Last resort: direct Supabase delete with anon key
    var { error } = await _supabase.from('users').delete().eq('id', id);
    if (error) {
      if (error.message?.includes('policy') || error.code === '42501') {
        toast(__('admin.toast.deletePermissionError') || 'Permission refusée. Configurez la clé service_role dans les paramètres.', 'error');
        return;
      }
      throw error;
    }
    toast(__('admin.toast.userDeleted'), 'success');
    loadUsers();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

// ===== REQUESTS =====
async function ensureSupabaseSession() {
  if (!_supabase) return;
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) return;
    // Try to restore from stored Supabase session key
    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (key) {
      const stored = JSON.parse(localStorage.getItem(key));
      if (stored?.access_token) {
        await _supabase.auth.setSession({ access_token: stored.access_token, refresh_token: stored.refresh_token });
      }
    }
  } catch(e) {
    console.warn('Session restore skipped:', e.message);
  }
}

async function loadRequests(statusFilter = '') {
  try {
    STATE.isLoading = true;
    let data = null;

    // Try backend proxy first (only if running on a server, not file://)
    if (window.location.protocol !== 'file:') {
      try {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const resp = await fetch('/api/admin/panel/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminSession: JSON.parse(adminSession) })
          });
          if (resp.ok) {
            const result = await resp.json();
            if (result.success) {
              data = result.data;
              STATE.documents = result.documents || [];
            }
          }
        }
      } catch(e) { /* backend not available */ }
    }

    // Fallback: Direct Supabase query
    if (!data) {
      if (!_supabase) await initSupabase();
      await ensureSupabaseSession();
      let query = _supabase.from('requests').select('*').order('created_at', { ascending: false });
      if (statusFilter) query = query.eq('status', statusFilter);
      const result = await query;
      if (result.error) throw result.error;
      data = result.data || [];
    }
    
    STATE.requests = data || [];

    // Load documents (only if not already loaded from backend proxy)
    if (STATE.documents.length === 0) {
      try {
        if (!_supabase) await initSupabase();
        await ensureSupabaseSession();
        const requestIds = (data || []).map(r => r.id).filter(Boolean);
        if (requestIds.length > 0) {
          const { data: docs, error: docsErr } = await _supabase
            .from('documents')
            .select('id, request_id, file_name, file_type, public_url, storage_path, created_at')
            .in('request_id', requestIds)
            .order('created_at', { ascending: false });
          if (docsErr) throw docsErr;
          STATE.documents = docs || [];
        } else {
          STATE.documents = [];
        }
      } catch (e) {
        console.warn('Could not load documents:', e);
        toast(__('admin.toast.loadAttachmentsFailed'), 'warning');
        STATE.documents = [];
      }
    }

    renderRequestsTable(STATE.requests);
    if (!data || data.length === 0) {
      const tbody = document.getElementById('requestsTableBody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="9">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>${__('admin.toast.noRequests')}</h3>
          </div>
        </td></tr>`;
      }
    }
  } catch(e) {
    console.error('Requests error:', e);
    toast(__('admin.toast.loadRequestsFailed'), 'error');
  } finally {
    STATE.isLoading = false;
  }
}

function renderRequestsTable(requests) {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;
  
  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-clipboard-list"></i><h3>' + __('admin.empty.noRequests') + '</h3></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = requests.map(r => {
    const statuses = ['pending', 'under_review', 'waiting_info', 'approved', 'in_progress', 'completed', 'cancelled'];
    var statusLabels = { pending: __('admin.requests.pending'), under_review: __('admin.requests.underReview'), waiting_info: __('admin.requests.waitingInfo'), approved: __('admin.requests.approved'), in_progress: __('admin.requests.inProgress'), completed: __('admin.requests.completed'), cancelled: __('admin.requests.cancelled') };
    return `<tr>
      <td class="font-semibold">${r.request_number || r.id.slice(0,8)}</td>
      <td>${r.school_name || 'N/A'}</td>
      <td>${r.service_name || r.service_key}</td>
      <td><span class="badge badge-${r.priority || 'normal'}">${r.priority || 'normal'}</span></td>
      <td>
        <select class="status-select" onchange="updateRequestStatus('${r.id}', this.value)">
          ${statuses.map(s => `<option value="${s}" ${r.status===s?'selected':''}>${statusLabels[s] || s}</option>`).join('')}
        </select>
      </td>
      <td class="text-muted text-sm">${r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
      <td>${(() => { const docs = STATE.documents.filter(d => d.request_id === r.id); return docs.length ? `<div style="display:flex;gap:4px;">${docs.map(d => d.public_url ? `<a href="${d.public_url}" download class="btn-icon btn-icon-download" title="Télécharger ${d.file_name}"><i class="fas fa-download"></i></a><a href="${d.public_url}" target="_blank" class="btn-icon btn-icon-view" title="Voir ${d.file_name}"><i class="fas fa-eye"></i></a>` : `<span class="btn-icon" style="cursor:default;opacity:0.3;" title="Fichier indisponible"><i class="fas fa-ban"></i></span>`).join(' ')}</div>` : '<span class="text-muted" style="font-size:0.85rem;">—</span>'; })()}</td>
      <td>${r.quotation_url ? `<a href="${r.quotation_url}" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-file-pdf"></i></a>` : '<span class="text-light">-</span>'}</td>
      <td>
        <div class="flex gap-1" style="flex-wrap:wrap;">
          <button class="btn-icon btn-icon-view" onclick="viewRequest('${r.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-icon-edit" onclick="editRequest('${r.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          ${r.quotation_url
            ? `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.6;cursor:not-allowed;" title="Devis already sent"><i class="fas fa-check-circle"></i> Devis envoyé</button>`
            : `<button class="btn btn-sm btn-success" onclick="uploadDevis('${r.id}')" title="Upload Devis"><i class="fas fa-file-pdf"></i> Devis</button>`}
          <button class="btn-icon btn-icon-delete" onclick="deleteRequest('${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterRequests() {
  const search = (document.getElementById('requestSearch')?.value || '').toLowerCase();
  const status = document.getElementById('requestStatusFilter')?.value || '';
  const priority = document.getElementById('requestPriorityFilter')?.value || '';
  const service = document.getElementById('requestServiceFilter')?.value || '';
  
  let filtered = STATE.requests.filter(r => {
    if (search && !(r.service_name||'').toLowerCase().includes(search) && !(r.school_name||'').toLowerCase().includes(search)) return false;
    if (status && r.status !== status) return false;
    if (priority && r.priority !== priority) return false;
    if (service && r.service_name !== service && r.service_key !== service) return false;
    return true;
  });
  
  renderRequestsTable(filtered);
}

async function updateRequestStatus(id, newStatus) {
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    const { error } = await _supabase.from('requests').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
    toast(__('admin.toast.statusUpdated') + ' ' + newStatus.replace(/_/g, ' '), 'success');
    
    // Log to audit
    if (_supabase) {
      await _supabase.from('activity_logs').insert({
        admin_id: STATE.user?.id,
        action_type: 'status_change',
        entity_type: 'request',
        entity_id: id,
        new_value: { status: newStatus }
      });
    }
    
    loadRequests();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

async function viewRequest(id) {
  const r = STATE.requests.find(x => x.id === id);
  if (!r) return;
  
  // Fetch documents for this request
  let documentsHtml = '';
  try {
    if (!_supabase) await initSupabase();
    if (_supabase) {
      const { data: docs, error } = await _supabase
        .from('documents')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: false });
      
      if (!error && docs && docs.length > 0) {
        documentsHtml = `<div class="mt-4"><div class="detail-label" style="margin-bottom:8px;font-weight:700;">${__('admin.modal.uploadedDocs')} (${docs.length})</div>`;
        docs.forEach(doc => {
          const icon = doc.file_type === 'pdf' ? 'fa-file-pdf' : 
                       ['png','jpg','jpeg','gif','webp'].includes(doc.file_type) ? 'fa-file-image' : 'fa-file-alt';
          const fileUrl = doc.public_url || '#';
          const previewHtml = (doc.public_url && ['png','jpg','jpeg','gif','webp'].includes(doc.file_type))
            ? `<img src="${doc.public_url}" style="max-width:120px;max-height:80px;border-radius:4px;object-fit:cover;" alt="${doc.file_name}">`
            : `<i class="fas ${icon}" style="font-size:1.5rem;color:var(--primary);"></i>`;
          documentsHtml += `
            <div class="quotation-preview" style="margin-bottom:6px;">
              ${previewHtml}
              <div class="info" style="flex:1;min-width:0;">
                <div class="name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${doc.file_name}</div>
                <div class="meta">${doc.file_type.toUpperCase()} ${doc.file_size ? `- ${(doc.file_size/1024).toFixed(0)} KB` : ''}</div>
              </div>
              <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-primary" style="flex-shrink:0;"><i class="fas fa-download"></i></a>
            </div>`;
        });
        documentsHtml += `</div>`;
      }
    }
  } catch(e) {
    console.error('Error fetching documents:', e);
  }
  
  const content = `
    <div class="detail-row"><span class="detail-label">${__('admin.table.requestId')}</span><span class="detail-value">${r.request_number || r.id}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.service')}</span><span class="detail-value">${r.service_name || r.service_key}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.school')}</span><span class="detail-value">${r.school_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.contact')}</span><span class="detail-value">${r.contact_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.email')}</span><span class="detail-value">${r.contact_email || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.modal.phone')}</span><span class="detail-value">${r.contact_phone || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.status')}</span><span class="detail-value"><span class="badge badge-${r.status}">${__('admin.requests.' + ({pending:'pending', under_review:'underReview', waiting_info:'waitingInfo', approved:'approved', in_progress:'inProgress', completed:'completed', cancelled:'cancelled'}[r.status] || r.status))}</span></span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.priority')}</span><span class="detail-value"><span class="badge badge-${r.priority||'normal'}">${r.priority||'normal'}</span></span></div>
    <div class="detail-row"><span class="detail-label">${__('admin.table.created')}</span><span class="detail-value">${r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</span></div>
    ${r.description ? `<div class="detail-row"><span class="detail-label">${__('admin.table.description')}</span><span class="detail-value">${r.description}</span></div>` : ''}
    ${r.quotation_url ? `
      <div class="mt-4">
        <div class="quotation-preview">
          <i class="fas fa-file-pdf"></i>
          <div class="info">
            <div class="name">${__('admin.table.quotationDoc')}</div>
            <div class="meta">PDF</div>
          </div>
          <a href="${r.quotation_url}" target="_blank" class="btn btn-sm btn-primary"><i class="fas fa-download"></i> ${__('admin.table.download')}</a>
        </div>
      </div>
    ` : ''}
    ${documentsHtml}
  `;
  
  openModal(`Request: ${r.service_name || r.service_key}`, content);
}

async function editRequest(id) {
  const r = STATE.requests.find(x => x.id === id);
  if (!r) return;
  
  var statusLabels = { pending: __('admin.requests.pending'), under_review: __('admin.requests.underReview'), waiting_info: __('admin.requests.waitingInfo'), approved: __('admin.requests.approved'), in_progress: __('admin.requests.inProgress'), completed: __('admin.requests.completed'), cancelled: __('admin.requests.cancelled') };
  const statuses = ['pending', 'under_review', 'waiting_info', 'approved', 'in_progress', 'completed', 'cancelled'];
  const priorities = ['low', 'normal', 'high', 'urgent', 'critical'];
  
  const content = `
    <form id="editRequestForm" onsubmit="saveRequest(event, '${id}')">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.status')}</label>
          <select class="form-select" id="editReqStatus">
            ${statuses.map(s => `<option value="${s}" ${r.status===s?'selected':''}>${statusLabels[s] || s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.priority')}</label>
          <select class="form-select" id="editReqPriority">
            ${priorities.map(p => `<option value="${p}" ${r.priority===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.contactName')}</label>
          <input class="form-input" id="editReqContact" value="${r.contact_name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.contactEmail')}</label>
          <input class="form-input" type="email" id="editReqEmail" value="${r.contact_email||''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.school')}</label>
          <input class="form-input" id="editReqSchool" value="${r.school_name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.quoteAmount')}</label>
          <input class="form-input" type="number" id="editReqAmount" value="${r.quote_amount||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${__('admin.modal.notes')}</label>
        <textarea class="form-textarea" id="editReqNotes">${r.notes||''}</textarea>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${__('admin.modal.cancel')}</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${__('admin.modal.save')}</button>
      </div>
    </form>
  `;
  
  openModal(__('admin.modal.editRequest'), content);
}

async function saveRequest(e, id) {
  e.preventDefault();
  const updates = {
    status: document.getElementById('editReqStatus').value,
    priority: document.getElementById('editReqPriority').value,
    contact_name: document.getElementById('editReqContact').value,
    contact_email: document.getElementById('editReqEmail').value,
    school_name: document.getElementById('editReqSchool').value,
    quote_amount: document.getElementById('editReqAmount').value,
    notes: document.getElementById('editReqNotes').value
  };
  
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    const { error } = await _supabase.from('requests').update(updates).eq('id', id);
    if (error) throw error;
    toast(__('admin.toast.requestUpdated'), 'success');
    closeModal();
    loadRequests();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

async function deleteRequest(id) {
  if (!confirm(__('admin.toast.deleteRequestConfirm'))) return;
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    await ensureSupabaseSession();
    const { error } = await _supabase.from('requests').delete().eq('id', id);
    if (error) throw error;
    toast(__('admin.toast.requestDeleted'), 'success');
    loadRequests();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

// ===== UPLOAD DEVIS (PDF) via Modal =====
async function uploadDevis(requestId) {
  const req = STATE.requests.find(x => x.id === requestId);
  if (!req) return;

  const content = `
    <div style="margin-bottom:16px;">
      <div class="detail-row"><span class="detail-label">${__('admin.table.requestId')}</span><span class="detail-value">${req.request_number || req.id.slice(0,8)}</span></div>
      <div class="detail-row"><span class="detail-label">${__('admin.table.school')}</span><span class="detail-value">${req.school_name || 'N/A'}</span></div>
      <div class="detail-row"><span class="detail-label">${__('admin.table.service')}</span><span class="detail-value">${req.service_name || req.service_key}</span></div>
      ${req.quotation_url ? `
        <div class="detail-row"><span class="detail-label">${__('admin.modal.currentDevis')}</span><span class="detail-value"><a href="${req.quotation_url}" target="_blank" style="color:var(--primary);"><i class="fas fa-file-pdf"></i> ${__('admin.modal.viewCurrent')}</a></span></div>
      ` : ''}
    </div>
    <div style="border:2px dashed var(--border);border-radius:8px;padding:24px;text-align:center;margin-bottom:16px;" id="devisDropZone">
      <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--primary);margin-bottom:8px;"></i>
      <p style="margin:0 0 4px;font-weight:600;">${__('admin.modal.selectDevis')}</p>
      <p style="margin:0 0 12px;font-size:0.85rem;color:var(--text-light);">${__('admin.modal.pdfHint')}</p>
      <input type="file" id="devisFileInput" accept=".pdf" style="display:none;">
      <button class="btn btn-primary btn-sm" onclick="document.getElementById('devisFileInput').click()"><i class="fas fa-folder-open"></i> ${__('admin.modal.browse')}</button>
      <span id="devisFileName" style="display:inline-block;margin-left:8px;font-size:0.85rem;color:var(--text-light);"></span>
    </div>
    <div id="devisUploadProgress" style="display:none;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px;">
        <span>${__('admin.modal.uploading')}</span>
        <span id="devisProgressPct">0%</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
        <div id="devisProgressBar" style="height:100%;width:0%;background:var(--primary);border-radius:3px;transition:width 0.3s;"></div>
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" id="devisUploadBtn" onclick="processDevisUpload('${requestId}')"><i class="fas fa-upload"></i> Upload Devis</button>
    </div>
  `;

  openModal(__('admin.modal.uploadDevis') + ' - ' + (req.service_name || req.service_key), content);

  // Bind file input change
  setTimeout(() => {
    const input = document.getElementById('devisFileInput');
    const nameSpan = document.getElementById('devisFileName');
    const uploadBtn = document.getElementById('devisUploadBtn');
    if (input) {
      input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          nameSpan.textContent = this.files[0].name;
          if (uploadBtn) uploadBtn.disabled = false;
        }
      });
    }
  }, 50);
}

async function processDevisUpload(requestId) {
  const input = document.getElementById('devisFileInput');
  if (!input || !input.files || !input.files[0]) {
      toast(__('admin.toast.selectPDF'), 'warning');
    return;
  }

  const file = input.files[0];

  if (file.type !== 'application/pdf') {
    toast(__('admin.toast.selectPDF'), 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast(__('admin.toast.fileTooLarge'), 'error');
    return;
  }

  const uploadBtn = document.getElementById('devisUploadBtn');
  const progress = document.getElementById('devisUploadProgress');
  if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + __('admin.modal.uploading'); }
  if (progress) progress.style.display = 'block';

  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }

    // Simulate progress
    const bar = document.getElementById('devisProgressBar');
    const pct = document.getElementById('devisProgressPct');
    if (bar) bar.style.width = '30%';
    if (pct) pct.textContent = '30%';

    const filePath = `devis/${requestId}/${Date.now()}_${file.name}`;

    let publicUrl = null;
    try {
      const { error: uploadError } = await _supabase.storage
        .from('quotations')
        .upload(filePath, file);

      if (uploadError) {
        const { error: altError } = await _supabase.storage
          .from('documents')
          .upload(filePath, file);
        if (altError) throw altError;

        const { data: urlData } = _supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        publicUrl = urlData?.publicUrl || null;
      } else {
        const { data: urlData } = _supabase.storage
          .from('quotations')
          .getPublicUrl(filePath);
        publicUrl = urlData?.publicUrl || null;
      }
    } catch (storageErr) {
      publicUrl = null;
    }

    if (bar) bar.style.width = '70%';
    if (pct) pct.textContent = '70%';

    // Save to DB: try backend proxy first, fallback to direct Supabase
    const adminSession = localStorage.getItem('adminSession');
    let dbSuccess = false;

    if (publicUrl && window.location.protocol !== 'file:' && adminSession) {
      try {
        const resp = await fetch('/api/admin/panel/upload-devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminSession: JSON.parse(adminSession),
            requestId,
            fileName: file.name,
            fileType: 'pdf',
            fileSize: file.size,
            storagePath: filePath,
            publicUrl
          })
        });
        if (resp.ok) dbSuccess = true;
      } catch(e) { /* proxy not available */ }
    }

    if (!dbSuccess && publicUrl) {
      // Direct Supabase fallback
      await _supabase.from('documents').insert({
        request_id: requestId,
        category: 'devis',
        file_name: file.name,
        file_type: 'pdf',
        file_size: file.size,
        storage_path: filePath,
        public_url: publicUrl,
        uploaded_by: STATE.user?.id || null
      });

      await _supabase.from('requests').update({
        quotation_url: publicUrl,
        status: 'devis_envoye'
      }).eq('id', requestId);

      const { data: reqData } = await _supabase.from('requests').select('user_id, service_name').eq('id', requestId).single();
      if (reqData?.user_id) {
        await _supabase.from('notifications').insert({
          user_id: reqData.user_id,
          type: 'devis_disponible',
          title: 'Devis disponible',
          message: `Un devis est disponible pour votre demande "${reqData.service_name || 'Service'}"`,
          data: { request_id: requestId, devis_url: publicUrl }
        });
      }
    }

    if (bar) bar.style.width = '100%';
    if (pct) pct.textContent = '100%';

    setTimeout(() => {
      toast(__('admin.toast.devisUploaded'), 'success');
      closeModal();
      loadRequests();
    }, 500);

  } catch(err) {
    console.error('Upload devis error:', err);
    toast(__('admin.toast.devisUploadError') + ': ' + err.message, 'error');
    if (uploadBtn) { uploadBtn.disabled = false; uploadBtn.innerHTML = '<i class="fas fa-upload"></i> ' + __('admin.modal.uploadDevis'); }
  }
}

// ===== SERVICES =====
async function loadServices() {
  try {
    if (!_supabase) await initSupabase();
    const { data, error } = await _supabase.from('service_categories').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    STATE.services = data || [];
    renderServicesTable(STATE.services);
  } catch(e) {
    console.error('Services error:', e);
    toast(__('admin.toast.loadServicesFailed'), 'error');
  }
}

function renderServicesTable(services) {
  const tbody = document.getElementById('servicesTableBody');
  if (!tbody) return;
  
  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-cogs"></i><h3>' + __('admin.empty.noServices') + '</h3></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = services.map(s => `<tr>
    <td class="font-semibold">${s.name_fr || s.key}</td>
    <td>${s.key}</td>
    <td>${s.name_en || '-'}</td>
    <td>${s.name_ar || '-'}</td>
    <td><span class="badge ${s.is_active ? 'badge-active' : 'badge-archived'}">${s.is_active ? 'Active' : 'Inactive'}</span></td>
    <td>
      <div class="flex gap-1">
        <button class="btn-icon btn-icon-edit" onclick="editService('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-icon-delete" onclick="toggleService('${s.id}', ${!s.is_active})" title="Toggle">
          <i class="fas ${s.is_active ? 'fa-eye-slash' : 'fa-eye'}"></i>
        </button>
      </div>
    </td>
  </tr>`).join('');
}

async function editService(id) {
  const s = STATE.services.find(x => x.id === id);
  if (!s) return;
  
  const content = `
    <form id="editServiceForm" onsubmit="saveService(event, '${id}')">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.nameFR')}</label>
          <input class="form-input" id="editSvcFr" value="${s.name_fr || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.nameEN')}</label>
          <input class="form-input" id="editSvcEn" value="${s.name_en || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${__('admin.modal.nameAR')}</label>
          <input class="form-input" id="editSvcAr" value="${s.name_ar || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">${__('admin.modal.sortOrder')}</label>
          <input class="form-input" type="number" id="editSvcOrder" value="${s.sort_order || 0}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${__('admin.modal.descriptionFR')}</label>
        <textarea class="form-textarea" id="editSvcDesc">${s.description_fr || ''}</textarea>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${__('admin.modal.cancel')}</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${__('admin.modal.save')}</button>
      </div>
    </form>
  `;
  
  openModal(__('admin.modal.editService'), content);
}

async function saveService(e, id) {
  e.preventDefault();
  const updates = {
    name_fr: document.getElementById('editSvcFr').value,
    name_en: document.getElementById('editSvcEn').value,
    name_ar: document.getElementById('editSvcAr').value,
    sort_order: Number(document.getElementById('editSvcOrder').value) || 0,
    description_fr: document.getElementById('editSvcDesc').value
  };
  
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    const { error } = await _supabase.from('service_categories').update(updates).eq('id', id);
    if (error) throw error;
    toast(__('admin.toast.serviceUpdated'), 'success');
    closeModal();
    loadServices();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

async function toggleService(id, active) {
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    const { error } = await _supabase.from('service_categories').update({ is_active: active }).eq('id', id);
    if (error) throw error;
    toast(active ? __('admin.toast.serviceActivated') : __('admin.toast.serviceDeactivated'), 'success');
    loadServices();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

// ===== QUOTATIONS =====
async function loadQuotations() {
  try {
    if (!_supabase) await initSupabase();
    const { data, error } = await _supabase.from('quotes').select('*, request:request_id(service_name, school_name)').order('created_at', { ascending: false });
    if (error) throw error;
    
    STATE.quotations = data || [];
    renderQuotationsTable(STATE.quotations);
  } catch(e) {
    console.error('Quotations error:', e);
    toast(__('admin.toast.loadQuotationsFailed'), 'error');
  }
}

function renderQuotationsTable(quotations) {
  const tbody = document.getElementById('quotationsTableBody');
  if (!tbody) return;
  
  if (quotations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-file-invoice-dollar"></i><h3>' + __('admin.empty.noQuotations') + '</h3></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = quotations.map(q => `<tr>
    <td class="font-semibold">${q.request?.service_name || 'N/A'}</td>
    <td>${q.request?.school_name || 'N/A'}</td>
    <td>v${q.version || 1}</td>
    <td class="text-muted text-sm">${q.uploaded_at ? new Date(q.uploaded_at).toLocaleDateString() : '-'}</td>
    <td>
      <a href="${q.file_url}" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-file-pdf"></i> View</a>
    </td>
    <td>
      <div class="flex gap-1">
        <button class="btn-icon btn-icon-delete" onclick="deleteQuotation('${q.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </td>
  </tr>`).join('');
}

async function deleteQuotation(id) {
  if (!confirm(__('admin.toast.deleteQuotationConfirm'))) return;
  try {
    if (!_supabase) await initSupabase();
    if (!_supabase) {
      toast(__('admin.toast.noDbConnection'), 'warning');
      return;
    }
    await ensureSupabaseSession();
    const { error } = await _supabase.from('quotes').delete().eq('id', id);
    if (error) throw error;
    toast(__('admin.toast.quotationDeleted'), 'success');
    loadQuotations();
  } catch(e) {
    toast(__('admin.toast.loadError') + e.message, 'error');
  }
}

// ===== ANALYTICS =====
async function loadAnalytics() {
  try {
    if (!_supabase) await initSupabase();
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    const { data, error } = await _supabase.from('requests').select('created_at, status, service_name, service_key').gte('created_at', yearStart).lte('created_at', yearEnd);
    if (error) throw error;
    
    const requests = data || [];
    
    // Requests by month
    const months = {};
    requests.forEach(r => {
      if (!r.created_at) return;
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months[key] = (months[key]||0) + 1;
    });
    
    const container = document.getElementById('analyticsChart');
    if (container) {
      const sorted = Object.entries(months).sort((a,b) => a[0].localeCompare(b[0]));
      if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><h3>' + __('admin.empty.noData') + '</h3></div>';
      } else {
        const max = Math.max(...sorted.map(([,v]) => v), 1);
        container.innerHTML = sorted.map(([k,v]) => `
          <div class="chart-bar-group">
            <div class="chart-bar-label"><span>${k}</span><span>${v}</span></div>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${(v/max)*100}%"></div></div>
          </div>
        `).join('');
      }
    }
    
    // Conversion rate
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const conversion = total > 0 ? ((completed/total)*100).toFixed(1) : 0;
    
    document.getElementById('analyticsConversion').textContent = conversion + '%';
    document.getElementById('analyticsTotal').textContent = total;
    document.getElementById('analyticsCompleted').textContent = completed;
    document.getElementById('analyticsPending').textContent = requests.filter(r => r.status === 'pending').length;
    
  } catch(e) {
    console.error('Analytics error:', e);
    toast(__('admin.toast.loadAnalyticsFailed'), 'error');
  }
}

// ===== SETTINGS =====
function loadSettings() {
  // Settings are loaded via the HTML template
}

function toggleDarkMode() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('adminTheme', newTheme);
  toast(__('admin.toast.themeSwitched') + ' ' + newTheme, 'info');
}

function saveServiceRoleKey() {
  var input = document.getElementById('serviceRoleKeyInput');
  var status = document.getElementById('serviceRoleStatus');
  if (!input || !input.value.trim()) {
    if (status) status.textContent = 'Please enter a valid key.';
    return;
  }
  localStorage.setItem('supabaseServiceKey', input.value.trim());
  // Reset the admin client so it picks up the new key
  _supabaseAdmin = null;
  if (status) { status.textContent = '✓ Key saved! Refreshing admin client...'; status.style.color = '#10b981'; }
  toast('Service role key saved successfully', 'success');
  setTimeout(function() { location.reload(); }, 1200);
}

// ===== AUDIT LOGS =====
async function loadAuditLogs() {
  try {
    if (!_supabase) await initSupabase();
    let logs = [];
    
    if (!_supabase) {
      logs = [];
    } else {
      const { data, error } = await _supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      logs = data || [];
    }
    
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;
    
    if (!logs || logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-history"></i><h3>' + __('admin.empty.noAuditLogs') + '</h3></div></td></tr>';
      return;
    }
    
    tbody.innerHTML = logs.map(a => `<tr>
      <td class="text-muted text-sm">${new Date(a.created_at).toLocaleString()}</td>
      <td><span class="badge badge-review">${a.action}</span></td>
      <td>${a.entity_type} ${a.entity_id ? a.entity_id.slice(0,8) : ''}</td>
      <td class="text-muted text-sm">${a.user_id ? a.user_id.slice(0,8) : 'System'}</td>
    </tr>`).join('');
  } catch(e) {
    console.error('Audit logs error:', e);
  }
}

// ===== MODAL =====
function openModal(title, content) {
  const overlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = content;
  if (overlay) overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ===== EXPORT =====
function exportCSV(type) {
  let data = [];
  switch(type) {
    case 'users': data = STATE.users; break;
    case 'requests': data = STATE.requests; break;
    case 'quotations': data = STATE.quotations; break;
    default: return;
  }
  
  if (data.length === 0) { toast(__('admin.toast.noDataExport'), 'warning'); return; }
  
  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];
  data.forEach(row => {
    csv.push(headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    }).join(','));
  });
  
  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${type}_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  toast(__('admin.toast.csvExported'), 'success');
}

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem('adminSession');
  window.location.href = 'login.html';
}

// ===== NOTIFICATIONS =====
async function loadNotifications() {
  try {
    ensureSupabaseSession();
    const { data, error } = await _supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    STATE.notifications = data || [];
    renderNotifications();
  } catch (err) {
    console.error('Load notifications error:', err);
  }
}

function renderNotifications() {
  var list = document.getElementById('notifList');
  var badge = document.getElementById('notifBadge');
  if (!list) return;
  var unread = STATE.notifications.filter(function(n) { return !n.read_at; }).length;
  if (badge) {
    badge.textContent = unread;
    badge.classList.toggle('show', unread > 0);
  }
  if (STATE.notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty"><i class="fas fa-bell-slash"></i><span>' + (I18n && I18n.t ? I18n.t('admin.noNotifications') || 'Aucune notification' : 'Aucune notification') + '</span></div>';
    return;
  }
  var html = '<div class="notif-list">';
  for (var i = 0; i < STATE.notifications.length; i++) {
    var n = STATE.notifications[i];
    var iconType = n.type === 'devis_disponible' || n.type === 'success' ? 'success' : n.type === 'warning' ? 'warning' : n.type === 'error' ? 'danger' : 'info';
    var iconMap = { info: 'fa-info-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle', danger: 'fa-times-circle' };
    var time = n.created_at ? timeAgo(n.created_at) : '';
    html += '<div class="notif-item' + (n.read_at ? '' : ' unread') + '" data-id="' + n.id + '" onclick="markAsRead(\'' + n.id + '\')">';
    html += '<div class="notif-icon ' + iconType + '"><i class="fas ' + (iconMap[iconType] || 'fa-bell') + '"></i></div>';
    html += '<div class="notif-body">';
    html += '<div class="notif-title">' + escHtml(n.title || '') + '</div>';
    html += '<div class="notif-message">' + escHtml(n.message || '') + '</div>';
    html += '<div class="notif-time">' + time + '</div>';
    html += '</div></div>';
  }
  html += '</div>';
  list.innerHTML = html;
}

function timeAgo(dateStr) {
  var diff = Date.now() - new Date(dateStr).getTime();
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return '\u00e0 l\'instant';
  if (mins < 60) return 'il y a ' + mins + ' min';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return 'il y a ' + hrs + 'h';
  var days = Math.floor(hrs / 24);
  return 'il y a ' + days + 'j';
}

function escHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

async function markAsRead(id) {
  try {
    ensureSupabaseSession();
    await _supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
    var notif = STATE.notifications.find(function(n) { return n.id === id; });
    if (notif) notif.read_at = new Date().toISOString();
    renderNotifications();
  } catch (err) {
    console.error('Mark as read error:', err);
  }
}

async function markAllRead() {
  var unreadIds = STATE.notifications.filter(function(n) { return !n.read_at; }).map(function(n) { return n.id; });
  if (unreadIds.length === 0) return;
  try {
    ensureSupabaseSession();
    await _supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', unreadIds);
    for (var i = 0; i < STATE.notifications.length; i++) {
      STATE.notifications[i].read_at = new Date().toISOString();
    }
    renderNotifications();
  } catch (err) {
    console.error('Mark all read error:', err);
  }
}

// Expose functions globally
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.filterUsers = filterUsers;
window.filterRequests = filterRequests;
window.viewUser = viewUser;
window.editUser = editUser;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.viewRequest = viewRequest;
window.editRequest = editRequest;
window.saveRequest = saveRequest;
window.deleteRequest = deleteRequest;
window.loadNotifications = loadNotifications;
window.markAsRead = markAsRead;
window.markAllRead = markAllRead;
window.updateRequestStatus = updateRequestStatus;
window.uploadDevis = uploadDevis;
window.processDevisUpload = processDevisUpload;
window.editService = editService;
window.saveService = saveService;
window.toggleService = toggleService;
window.deleteQuotation = deleteQuotation;
window.openModal = openModal;
window.closeModal = closeModal;
window.exportCSV = exportCSV;
window.toggleDarkMode = toggleDarkMode;
window.saveServiceRoleKey = saveServiceRoleKey;
window.logout = logout;