/**
 * SMARTSERVICES Schools - Premium Admin Dashboard
 * Enterprise-grade administration panel
 * ============================================
 */

// ===== STATE =====
const STATE = {
  user: null,
  users: [],
  requests: [],
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

async function initSupabase() {
  if (_supabase) return _supabase;
  
  const SUPABASE_URL = 'https://rsriyrvkizgnhvgsosgk.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcml5cnZraXpnbmh2Z3Nvc2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzcxMjMsImV4cCI6MjA5ODkxMzEyM30.QkRn1oqI7UdDbi6LdJWlU8xrZXdFz7sqXxLqmxaUBy0';

  // Check if Supabase is already loaded (by js/supabase.js or another script)
  if (window.__supabase) {
    _supabase = window.__supabase;
    return _supabase;
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
  if (name) name.textContent = user.full_name || user.email || 'Admin';
  if (role) role.textContent = user.role || 'admin';
  if (headerName) headerName.textContent = user.full_name || user.email || 'Admin';
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

// ===== NOTE: No mock data - only real database data is shown =====

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
  // Check auth
  const user = await checkAuth();
  if (!user) return;
  
  // Update UI
  updateUserUI(user);
  
  // Load theme
  const savedTheme = localStorage.getItem('adminTheme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Try to init Supabase
  await initSupabase();
  
  // Load dashboard with real data only
  loadDashboard();
});

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const [usersRes, requestsRes, quotationsRes] = await Promise.all([
      _supabase.from('users').select('*', { count: 'exact', head: true }),
      _supabase.from('requests').select('*'),
      _supabase.from('quotations').select('*', { count: 'exact', head: true })
    ]);
    
    const requests = requestsRes.data || [];
    const users = usersRes.data || [];
    const quotations = quotationsRes.data || [];
    
    const totalUsers = users.length;
    const totalQuotations = quotations.length;
    
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in_progress' || r.status === 'under_review').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const totalRequests = requests.length;
    
    // Update stat cards
    document.getElementById('statTotalRequests').textContent = totalRequests;
    document.getElementById('statActiveRequests').textContent = inProgress;
    document.getElementById('statCompletedRequests').textContent = completed;
    document.getElementById('statTotalUsers').textContent = totalUsers;
    document.getElementById('statQuotations').textContent = totalQuotations;
    
    // Revenue estimate
    const revenue = requests.reduce((sum, r) => sum + (Number(r.quote_amount) || 0), 0);
    document.getElementById('statRevenue').textContent = `${revenue.toLocaleString()} MAD`;
    
    // Monthly chart
    renderMonthlyChart(requests);
    
    // Service distribution
    renderServiceChart(requests);
    
    // Status distribution
    renderStatusChart(requests);
    
    // Recent activity
    renderRecentActivity(requests.slice(0, 10));
    
  } catch(e) {
    console.error('Dashboard error:', e);
    toast('Failed to load dashboard data', 'error');
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
    container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>No data yet</h3></div>';
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
    container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><h3>No data yet</h3></div>';
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
  const labels = { pending: 'Pending', under_review: 'Under Review', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
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
    container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><h3>No recent activity</h3></div>';
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
    let query = _supabase.from('users').select('*').order('created_at', { ascending: false });
    if (roleFilter) query = query.eq('role', roleFilter);
    const { data, error } = await query;
    if (error) throw error;
    
    STATE.users = data || [];
    renderUsersTable(STATE.users);
  } catch(e) {
    console.error('Users error:', e);
    toast('Failed to load users', 'error');
  } finally {
    STATE.isLoading = false;
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-users"></i><h3>No users found</h3></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = users.map(u => {
    const initials = (u.full_name || u.email || '?').charAt(0).toUpperCase();
    return `<tr>
      <td><div class="flex items-center gap-2"><div class="avatar avatar-sm">${initials}</div><span class="font-semibold">${u.full_name || 'N/A'}</span></div></td>
      <td class="text-muted">${u.email || 'N/A'}</td>
      <td>${u.school_name || '-'}</td>
      <td><span class="badge badge-${u.role === 'admin' ? 'approved' : 'normal'}">${u.role || 'user'}</span></td>
      <td><span class="badge badge-${u.account_status || 'active'}">${u.account_status || 'active'}</span></td>
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
    <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${u.full_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${u.email || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">School</span><span class="detail-value">${u.school_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${u.role || 'user'}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${u.account_status || 'active'}</span></div>
    <div class="detail-row"><span class="detail-label">Total Requests</span><span class="detail-value">${userRequests.length}</span></div>
    <div class="detail-row"><span class="detail-label">Joined</span><span class="detail-value">${u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</span></div>
    <div class="detail-row"><span class="detail-label">Last Login</span><span class="detail-value">${u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</span></div>
  `;
  
  openModal('User Profile', content);
}

async function editUser(id) {
  const u = STATE.users.find(x => x.id === id);
  if (!u) return;
  
  const content = `
    <form id="editUserForm" onsubmit="saveUser(event, '${id}')">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-input" id="editUserName" value="${u.full_name || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" id="editUserEmail" value="${u.email || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">School</label>
          <input class="form-input" id="editUserSchool" value="${u.school_name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" id="editUserPhone" value="${u.phone || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-select" id="editUserRole">
            <option value="user" ${u.role==='user'?'selected':''}>User</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="editUserStatus">
            <option value="active" ${u.account_status==='active'?'selected':''}>Active</option>
            <option value="suspended" ${u.account_status==='suspended'?'selected':''}>Suspended</option>
            <option value="archived" ${u.account_status==='archived'?'selected':''}>Archived</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
      </div>
    </form>
  `;
  
  openModal('Edit User', content);
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
    if (!supabase) {
      toast('Database not connected - changes not saved', 'warning');
      return;
    }
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) throw error;
    toast('User updated successfully', 'success');
    closeModal();
    loadUsers();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
  try {
    if (!supabase) {
      toast('Database not connected - cannot delete', 'warning');
      return;
    }
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    toast('User deleted', 'success');
    loadUsers();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ===== REQUESTS =====
async function loadRequests(statusFilter = '') {
  try {
    STATE.isLoading = true;
    let query = supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (error) throw error;
    
    STATE.requests = data || [];
    renderRequestsTable(STATE.requests);
  } catch(e) {
    console.error('Requests error:', e);
    toast('Failed to load requests', 'error');
  } finally {
    STATE.isLoading = false;
  }
}

function renderRequestsTable(requests) {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;
  
  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-clipboard-list"></i><h3>No requests found</h3></div></td></tr>';
    return;
  }
  
  tbody.innerHTML = requests.map(r => {
    const statuses = ['pending', 'under_review', 'waiting_info', 'approved', 'in_progress', 'completed', 'cancelled'];
    return `<tr>
      <td class="font-semibold">${r.request_number || r.id.slice(0,8)}</td>
      <td>${r.school_name || 'N/A'}</td>
      <td>${r.service_name || r.service_key}</td>
      <td><span class="badge badge-${r.priority || 'normal'}">${r.priority || 'normal'}</span></td>
      <td>
        <select class="status-select" onchange="updateRequestStatus('${r.id}', this.value)">
          ${statuses.map(s => `<option value="${s}" ${r.status===s?'selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}
        </select>
      </td>
      <td class="text-muted text-sm">${r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
      <td>${r.assigned_admin_id ? r.assigned_admin_id.slice(0,8) : '<span class="text-light">Unassigned</span>'}</td>
      <td>${r.quotation_url ? `<a href="${r.quotation_url}" target="_blank" class="btn btn-sm btn-success"><i class="fas fa-file-pdf"></i></a>` : '<span class="text-light">-</span>'}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn-icon btn-icon-view" onclick="viewRequest('${r.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-icon-edit" onclick="editRequest('${r.id}')" title="Edit"><i class="fas fa-edit"></i></button>
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
    if (!supabase) {
      toast('Database not connected - changes not saved', 'warning');
      return;
    }
    const { error } = await supabase.from('requests').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
    toast('Status updated to ' + newStatus.replace(/_/g, ' '), 'success');
    
    // Log to audit
    if (supabase) {
      await supabase.from('audit_logs').insert({
        user_id: STATE.user?.id,
        action: 'status_change',
        entity_type: 'request',
        entity_id: id,
        changes: { status: newStatus }
      });
    }
    
    loadRequests();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

async function viewRequest(id) {
  const r = STATE.requests.find(x => x.id === id);
  if (!r) return;
  
  const content = `
    <div class="detail-row"><span class="detail-label">Request #</span><span class="detail-value">${r.request_number || r.id}</span></div>
    <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${r.service_name || r.service_key}</span></div>
    <div class="detail-row"><span class="detail-label">School</span><span class="detail-value">${r.school_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">Contact</span><span class="detail-value">${r.contact_name || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${r.contact_email || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${r.contact_phone || 'N/A'}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-${r.status}">${r.status}</span></span></div>
    <div class="detail-row"><span class="detail-label">Priority</span><span class="detail-value"><span class="badge badge-${r.priority||'normal'}">${r.priority||'normal'}</span></span></div>
    <div class="detail-row"><span class="detail-label">Created</span><span class="detail-value">${r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</span></div>
    ${r.description ? `<div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${r.description}</span></div>` : ''}
    ${r.quotation_url ? `
      <div class="mt-4">
        <div class="quotation-preview">
          <i class="fas fa-file-pdf"></i>
          <div class="info">
            <div class="name">Quotation Document</div>
            <div class="meta">PDF File</div>
          </div>
          <a href="${r.quotation_url}" target="_blank" class="btn btn-sm btn-primary"><i class="fas fa-download"></i> Download</a>
        </div>
      </div>
    ` : ''}
  `;
  
  openModal(`Request: ${r.service_name || r.service_key}`, content);
}

async function editRequest(id) {
  const r = STATE.requests.find(x => x.id === id);
  if (!r) return;
  
  const statuses = ['pending', 'under_review', 'waiting_info', 'approved', 'in_progress', 'completed', 'cancelled'];
  const priorities = ['low', 'normal', 'high', 'urgent', 'critical'];
  
  const content = `
    <form id="editRequestForm" onsubmit="saveRequest(event, '${id}')">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="editReqStatus">
            ${statuses.map(s => `<option value="${s}" ${r.status===s?'selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" id="editReqPriority">
            ${priorities.map(p => `<option value="${p}" ${r.priority===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Contact Name</label>
          <input class="form-input" id="editReqContact" value="${r.contact_name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Contact Email</label>
          <input class="form-input" type="email" id="editReqEmail" value="${r.contact_email||''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">School</label>
          <input class="form-input" id="editReqSchool" value="${r.school_name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Quote Amount (MAD)</label>
          <input class="form-input" type="number" id="editReqAmount" value="${r.quote_amount||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" id="editReqNotes">${r.notes||''}</textarea>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
      </div>
    </form>
  `;
  
  openModal('Edit Request', content);
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
    if (!supabase) {
      toast('Database not connected - changes not saved', 'warning');
      return;
    }
    const { error } = await supabase.from('requests').update(updates).eq('id', id);
    if (error) throw error;
    toast('Request updated successfully', 'success');
    closeModal();
    loadRequests();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

async function deleteRequest(id) {
  if (!confirm('Are you sure you want to delete this request?')) return;
  try {
    if (!supabase) {
      toast('Database not connected - cannot delete', 'warning');
      return;
    }
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (error) throw error;
    toast('Request deleted', 'success');
    loadRequests();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ===== SERVICES =====
async function loadServices() {
  try {
    const { data, error } = await supabase.from('service_categories').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    STATE.services = data || [];
    renderServicesTable(STATE.services);
  } catch(e) {
    console.error('Services error:', e);
    toast('Failed to load services', 'error');
  }
}

function renderServicesTable(services) {
  const tbody = document.getElementById('servicesTableBody');
  if (!tbody) return;
  
  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-cogs"></i><h3>No services found</h3></div></td></tr>';
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
          <label class="form-label">Name (French)</label>
          <input class="form-input" id="editSvcFr" value="${s.name_fr || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Name (English)</label>
          <input class="form-input" id="editSvcEn" value="${s.name_en || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Name (Arabic)</label>
          <input class="form-input" id="editSvcAr" value="${s.name_ar || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Sort Order</label>
          <input class="form-input" type="number" id="editSvcOrder" value="${s.sort_order || 0}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description (French)</label>
        <textarea class="form-textarea" id="editSvcDesc">${s.description_fr || ''}</textarea>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
      </div>
    </form>
  `;
  
  openModal('Edit Service', content);
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
    if (!supabase) {
      toast('Database not connected - changes not saved', 'warning');
      return;
    }
    const { error } = await supabase.from('service_categories').update(updates).eq('id', id);
    if (error) throw error;
    toast('Service updated', 'success');
    closeModal();
    loadServices();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

async function toggleService(id, active) {
  try {
    if (!supabase) {
      toast('Database not connected - changes not saved', 'warning');
      return;
    }
    const { error } = await supabase.from('service_categories').update({ is_active: active }).eq('id', id);
    if (error) throw error;
    toast(`Service ${active ? 'activated' : 'deactivated'}`, 'success');
    loadServices();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ===== QUOTATIONS =====
async function loadQuotations() {
  try {
    const { data, error } = await supabase.from('quotations').select('*, request:request_id(service_name, school_name)').order('uploaded_at', { ascending: false });
    if (error) throw error;
    
    STATE.quotations = data || [];
    renderQuotationsTable(STATE.quotations);
  } catch(e) {
    console.error('Quotations error:', e);
    toast('Failed to load quotations', 'error');
  }
}

function renderQuotationsTable(quotations) {
  const tbody = document.getElementById('quotationsTableBody');
  if (!tbody) return;
  
  if (quotations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-file-invoice-dollar"></i><h3>No quotations found</h3></div></td></tr>';
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
  if (!confirm('Delete this quotation?')) return;
  try {
    if (!supabase) {
      toast('Database not connected - cannot delete', 'warning');
      return;
    }
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) throw error;
    toast('Quotation deleted', 'success');
    loadQuotations();
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ===== ANALYTICS =====
async function loadAnalytics() {
  try {
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    const { data, error } = await supabase.from('requests').select('created_at, status, service_name, service_key').gte('created_at', yearStart).lte('created_at', yearEnd);
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
        container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><h3>No data yet</h3></div>';
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
    toast('Failed to load analytics', 'error');
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
  toast(`Switched to ${newTheme} mode`, 'info');
}

// ===== AUDIT LOGS =====
async function loadAuditLogs() {
  try {
    let logs = [];
    
    if (!supabase) {
      logs = [];
    } else {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      logs = data || [];
    }
    
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;
    
    if (!logs || logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-history"></i><h3>No audit logs</h3></div></td></tr>';
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
  
  if (data.length === 0) { toast('No data to export', 'warning'); return; }
  
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
  toast('CSV exported', 'success');
}

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem('adminSession');
  window.location.href = 'login.html';
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
window.updateRequestStatus = updateRequestStatus;
window.editService = editService;
window.saveService = saveService;
window.toggleService = toggleService;
window.deleteQuotation = deleteQuotation;
window.openModal = openModal;
window.closeModal = closeModal;
window.exportCSV = exportCSV;
window.toggleDarkMode = toggleDarkMode;
window.logout = logout;