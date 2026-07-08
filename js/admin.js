/**
 * SMARTSERVICES Schools - Admin Panel
 * Handles admin authentication and user/request management
 */

// ===== ADMIN STATE =====
let isAdmin = false;
let currentAdmin = null;
let currentDevisRequestId = null;

// ===== HARDCODED ADMIN CREDENTIALS =====
const ADMIN_EMAIL = 'admin@smartservices.ma';
const ADMIN_PASSWORD = 'G12345678';

// ===== SUPABASE BUCKET FOR DEVIS PDFs =====
const DEVIS_BUCKET = 'devis';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize Supabase first
  await window.__supabase.init();
  
  // Check if admin is already logged in (from localStorage)
  const adminSession = localStorage.getItem('adminSession');
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      if (session.email === ADMIN_EMAIL) {
        isAdmin = true;
        currentAdmin = session;
        showAdminPanel();
      }
    } catch (e) {
      localStorage.removeItem('adminSession');
    }
  }

  // If not logged in, show login modal
  if (!isAdmin) {
    showAdminLogin();
  }

  // Setup navigation
  setupAdminNavigation();
});

// ===== AUTHENTICATION =====

function showAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function hideAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  btn.disabled = true;

  // Simulate network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check credentials
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    isAdmin = true;
    currentAdmin = {
      email: ADMIN_EMAIL,
      loginTime: new Date().toISOString()
    };
    
    // Store session in localStorage
    localStorage.setItem('adminSession', JSON.stringify(currentAdmin));
    
    hideAdminLogin();
    showAdminPanel();
    
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    // Clear form
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
  } else {
    btn.innerHTML = originalText;
    btn.disabled = false;
    alert('Email ou mot de passe incorrect.');
  }
}


// ===== NAVIGATION =====

function setupAdminNavigation() {
  const sidebar = document.querySelector('.admin-sidebar');
  if (!sidebar) {
    console.error('Admin sidebar not found');
    return;
  }

  // Event delegation for sidebar navigation
  sidebar.addEventListener('click', function(e) {
    const navItem = e.target.closest('.admin-nav-item');
    if (!navItem) return;

    // Handle logout separately
    if (navItem.id === 'adminLogoutBtn') {
      e.preventDefault();
      handleLogout();
      return;
    }

    // Handle view navigation
    const viewName = navItem.getAttribute('data-view');
    if (viewName) {
      e.preventDefault();
      setActiveNavItem(navItem);
      showView(viewName);
    }
  });

  // Event delegation for table action buttons
  const usersTableBody = document.getElementById('usersTableBody');
  if (usersTableBody) {
    usersTableBody.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-view-user');
      if (!btn) return;
      const userId = btn.getAttribute('data-user-id');
      if (userId) viewUserDetails(userId);
    });
  }

  const requestsTableBody = document.getElementById('requestsTableBody');
  if (requestsTableBody) {
    requestsTableBody.addEventListener('click', function(e) {
      const viewBtn = e.target.closest('.btn-view-request');
      if (viewBtn) {
        const requestId = viewBtn.getAttribute('data-request-id');
        if (requestId) viewRequestDetails(requestId);
        return;
      }
      
      const devisBtn = e.target.closest('.btn-devis');
      if (devisBtn) {
        const requestId = devisBtn.getAttribute('data-request-id');
        if (requestId) openDevisModal(requestId);
        return;
      }

      const receiptBtn = e.target.closest('.btn-view-receipt');
      if (receiptBtn) {
        const requestId = receiptBtn.getAttribute('data-request-id');
        if (requestId) generateReceipt(requestId);
      }
    });

    // Event delegation for status dropdown changes
    requestsTableBody.addEventListener('change', function(e) {
      const select = e.target.closest('.status-select');
      if (select) {
        const requestId = select.getAttribute('data-request-id');
        const newStatus = select.value;
        if (requestId) updateStatusInline(requestId, newStatus);
      }
    });
  }

  // Search inputs
  const userSearch = document.getElementById('userSearch');
  if (userSearch) {
    userSearch.addEventListener('input', debounce(filterUsers, 300));
  }

  const requestSearch = document.getElementById('requestSearch');
  if (requestSearch) {
    requestSearch.addEventListener('input', debounce(filterRequests, 300));
  }

  // Admin login form
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
}

function setActiveNavItem(activeItem) {
  // Remove active state from all nav items
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.classList.remove('active');
    item.removeAttribute('aria-current');
  });

  // Add active state to clicked item
  activeItem.classList.add('active');
  activeItem.setAttribute('aria-current', 'page');
}

function handleLogout() {
  // Clear admin session
  localStorage.removeItem('adminSession');
  
  // Clear any other stored data
  sessionStorage.clear();
  
  // Redirect to login or home page
  window.location.href = 'admin.html';
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showView(viewName) {
  // Hide all views
  document.querySelectorAll('.admin-view').forEach(view => {
    view.style.display = 'none';
  });
  
  // Show selected view
  const viewMap = {
    'dashboard': 'dashboardView',
    'users': 'usersView',
    'requests': 'requestsView'
  };
  
  const viewId = viewMap[viewName];
  if (viewId) {
    document.getElementById(viewId).style.display = 'block';
  }
  
  // Update page title
  const titleMap = {
    'dashboard': 'Tableau de bord',
    'users': 'Gestion des utilisateurs',
    'requests': 'Gestion des demandes'
  };
  
  document.getElementById('pageTitle').textContent = titleMap[viewName] || 'Administration';
  
  // Load data for specific views
  if (viewName === 'dashboard') {
    loadDashboardStats();
  } else if (viewName === 'users') {
    loadUsers();
  } else if (viewName === 'requests') {
    loadRequests();
  }
}

function showAdminPanel() {
  hideAdminLogin();
  document.getElementById('dashboardView').style.display = 'block';
  loadDashboardStats();
  loadRecentActivity();
}

// ===== RECENT ACTIVITY =====

async function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;

  try {
    const supabase = window.__supabase?.getClient();
    if (!supabase) {
      container.innerHTML = '<p class="text-center text-muted">Supabase non configuré.</p>';
      return;
    }

    // Fetch last 3 users and last 2 requests
    const [usersRes, requestsRes] = await Promise.all([
      supabase.from('users').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(3),
      supabase.from('requests').select('contact_name, service_name, created_at').order('created_at', { ascending: false }).limit(2)
    ]);

    const users = usersRes.data || [];
    const requests = requestsRes.data || [];

    if (!users.length && !requests.length) {
      container.innerHTML = '<p class="text-center text-muted">Aucune activité récente.</p>';
      return;
    }

    const items = [];

    users.forEach(u => {
      const timeAgo = getTimeAgo(u.created_at);
      items.push({
        icon: 'fa-user-plus',
        text: `<strong>Nouvel utilisateur inscrit</strong><br><small>${escapeHtml(u.full_name || u.email)}</small>`,
        time: timeAgo,
        rawTime: u.created_at
      });
    });

    requests.forEach(r => {
      const timeAgo = getTimeAgo(r.created_at);
      items.push({
        icon: 'fa-file-alt',
        text: `<strong>Nouvelle demande de service</strong><br><small>${escapeHtml(r.service_name || 'Service')} - ${escapeHtml(r.contact_name || '')}</small>`,
        time: timeAgo,
        rawTime: r.created_at
      });
    });

    // Sort newest first
    items.sort((a, b) => new Date(b.rawTime || 0) - new Date(a.rawTime || 0));

    container.innerHTML = items.map(it => `
      <div class="activity-item">
        <div class="activity-icon"><i class="fas ${it.icon}"></i></div>
        <div class="activity-details">
          <p>${it.text}</p>
          <span class="activity-time">${it.time}</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading recent activity:', error);
    container.innerHTML = '<p class="text-center text-danger">Erreur lors du chargement des activités.</p>';
  }
}

function getTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'À l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR');
}

// ===== DATA LOADING =====

async function loadDashboardStats() {
  try {
    const supabase = window.__supabase?.getClient();
    if (!supabase) {
      document.getElementById('totalUsers').textContent = '0';
      document.getElementById('totalRequests').textContent = '0';
      document.getElementById('pendingRequests').textContent = '0';
      document.getElementById('completedRequests').textContent = '0';
      return;
    }

    // Get total users count
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get requests stats
    const { data: requests } = await supabase
      .from('requests')
      .select('status');

    const pending = requests?.filter(r => r.status === 'pending').length || 0;
    const completed = requests?.filter(r => r.status === 'completed').length || 0;

    // Update UI
    document.getElementById('totalUsers').textContent = usersCount || 0;
    document.getElementById('totalRequests').textContent = requests?.length || 0;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('completedRequests').textContent = completed;

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    // Show zeros on error
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('totalRequests').textContent = '0';
    document.getElementById('pendingRequests').textContent = '0';
    document.getElementById('completedRequests').textContent = '0';
  }
}

async function loadUsers() {
  try {
    const supabase = window.__supabase?.getClient();
    const usersTableBody = document.getElementById('usersTableBody');
    if (!supabase) {
      usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun utilisateur trouvé</td></tr>';
      return;
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun utilisateur trouvé</td></tr>';
      return;
    }

    tbody.innerHTML = users.map((user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(user.full_name || 'N/A')}</strong></td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.school_name || 'N/A')}</td>
        <td>${escapeHtml(user.phone || 'N/A')}</td>
        <td>${formatDate(user.created_at)}</td>
        <td>
          <button class="btn-view btn-view-user" data-user-id="${user.id}" title="Voir détails">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error loading users:', error);
    const usersTableBody = document.getElementById('usersTableBody');
    if (usersTableBody) {
      usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Erreur lors du chargement des utilisateurs</td></tr>';
    }
  }
}

async function loadRequests() {
  try {
    const supabase = window.__supabase?.getClient();
    const requestsTableBody = document.getElementById('requestsTableBody');
    if (!supabase) {
      requestsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Aucune demande trouvée</td></tr>';
      return;
    }

    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tbody = document.getElementById('requestsTableBody');
    
    if (!requests || requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center">Aucune demande trouvée</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map((request, index) => {
      const hasDevis = request.quotation_url && request.quotation_url.trim() !== '';
      const statusClass = `status-${request.status}`;
      return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(request.contact_name || 'N/A')}</td>
        <td>${escapeHtml(request.service_name || request.service_key)}</td>
        <td>${escapeHtml(request.school_name || 'N/A')}</td>
        <td>${escapeHtml(request.city || 'N/A')}</td>
        <td>${formatDate(request.created_at)}</td>
        <td>
          <div class="status-select-wrapper">
            <select class="status-select ${statusClass}" data-request-id="${request.id}">
              <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>En attente</option>
              <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>En cours</option>
              <option value="approved" ${request.status === 'approved' ? 'selected' : ''}>Validé</option>
              <option value="rejected" ${request.status === 'rejected' ? 'selected' : ''}>Refusé</option>
              <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Terminé</option>
            </select>
          </div>
        </td>
        <td>
          ${hasDevis
            ? `<span class="devis-indicator available"><i class="fas fa-file-pdf"></i> PDF disponible</span>`
            : `<span class="devis-indicator unavailable"><i class="fas fa-times"></i> Aucun</span>`
          }
        </td>
        <td>
          <button class="btn-view btn-view-request" data-request-id="${request.id}" title="Voir détails">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-view btn-devis ${hasDevis ? 'has-devis' : ''}" data-request-id="${request.id}" title="Gérer le devis">
            <i class="fas fa-file-invoice"></i>
            ${hasDevis ? '<span class="devis-badge">PDF</span>' : ''}
          </button>
          <button class="btn-view btn-view-receipt" data-request-id="${request.id}" title="Générer reçu" style="background: #10b981;">
            <i class="fas fa-file-invoice"></i>
          </button>
        </td>
      </tr>
    `}).join('');

  } catch (error) {
    console.error('Error loading requests:', error);
    const requestsTableBody = document.getElementById('requestsTableBody');
    if (requestsTableBody) {
      requestsTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Erreur lors du chargement des demandes</td></tr>';
    }
  }
}

// ===== TOAST NOTIFICATION =====

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== INLINE STATUS UPDATE =====

async function updateStatusInline(requestId, newStatus) {
  const supabase = window.__supabase?.getClient();
  if (!supabase) {
    showToast('Supabase non configuré.', 'error');
    return;
  }

  const select = document.querySelector(`.status-select[data-request-id="${requestId}"]`);
  if (select) {
    select.classList.add('status-updating');
  }

  try {
    // Update request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // If status changed to "in_progress", automatically create an invoice
    if (newStatus === 'in_progress') {
      await createInvoiceForRequest(updatedRequest);
    }

    // Refresh dashboard stats
    await loadDashboardStats();

    showToast('Statut mis à jour avec succès !');

  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Erreur lors de la mise à jour du statut.', 'error');
    loadRequests();
  } finally {
    if (select) {
      select.classList.remove('status-updating');
    }
  }
}

async function createInvoiceForRequest(request) {
  const supabase = window.__supabase?.getClient();
  if (!supabase || !request) return;

  // Generate invoice number
  const invoiceNumber = 'FAC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);
  
  // Calculate amount (you can customize this based on your pricing logic)
  const amount = 0; // Default amount - can be customized
  const tax = 0; // 20% tax
  const totalAmount = amount + tax;

  // Create invoice
  const { error } = await supabase
    .from('invoices')
    .insert([
      {
        invoice_number: invoiceNumber,
        request_id: request.id,
        user_id: request.user_id,
        service_name: request.service_name || request.service_key,
        amount: amount,
        tax: tax,
        total_amount: totalAmount,
        currency: 'MAD',
        status: 'pending',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      }
    ]);

  if (error) {
    console.error('Error creating invoice:', error);
  } else {
    console.log('Invoice created:', invoiceNumber);
  }
}

// ===== DEVIS (QUOTATION) MANAGEMENT =====

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showUploadStatus(message, type) {
  const status = document.getElementById('uploadStatus');
  if (!status) return;
  status.className = `upload-status active ${type}`;
  const icons = { uploading: 'fa-spinner fa-spin', success: 'fa-check-circle', failed: 'fa-exclamation-circle' };
  status.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> ${message}`;
}

function updateProgress(percent) {
  const progress = document.getElementById('uploadProgress');
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  const pct = document.getElementById('progressPercent');
  if (progress) progress.classList.add('active');
  if (fill) fill.style.width = percent + '%';
  if (pct) pct.textContent = percent + '%';
  if (label && percent === 100) label.textContent = 'Finalisation...';
}

function removeSelectedFile() {
  document.getElementById('devisFileInput').value = '';
  document.getElementById('devisFilePreview').style.display = 'none';
  document.getElementById('devisUploadZone').classList.remove('has-file');
  document.getElementById('uploadStatus').className = 'upload-status';
  document.getElementById('uploadProgress').classList.remove('active');
}

async function openDevisModal(requestId) {
  currentDevisRequestId = requestId;
  
  // Reset UI
  removeSelectedFile();
  document.getElementById('uploadStatus').className = 'upload-status';
  document.getElementById('uploadProgress').classList.remove('active');
  
  // Check if there's an existing devis
  const supabase = window.__supabase?.getClient();
  if (supabase) {
    const { data: request, error } = await supabase
      .from('requests')
      .select('quotation_url')
      .eq('id', requestId)
      .single();
    
    if (!error && request && request.quotation_url) {
      document.getElementById('devisCurrentFile').style.display = 'flex';
      document.getElementById('devisCurrentLink').href = request.quotation_url;
      document.getElementById('devisUploadBtnText').textContent = 'Remplacer le devis';
    } else {
      document.getElementById('devisCurrentFile').style.display = 'none';
      document.getElementById('devisUploadBtnText').textContent = 'Téléverser le devis';
    }
  }
  
  document.getElementById('devisModal').classList.add('open');
}

function closeDevisModal() {
  document.getElementById('devisModal').classList.remove('open');
  currentDevisRequestId = null;
  removeSelectedFile();
}

// Setup drag-and-drop and file selection
document.addEventListener('DOMContentLoaded', function() {
  const uploadZone = document.getElementById('devisUploadZone');
  const fileInput = document.getElementById('devisFileInput');
  if (!uploadZone || !fileInput) return;

  // Click to browse
  uploadZone.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') fileInput.click();
  });

  // File selection handler
  fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      showUploadStatus('Seuls les fichiers PDF sont acceptés.', 'failed');
      this.value = '';
      return;
    }
    
    // Show file preview
    document.getElementById('devisFileName').textContent = file.name;
    document.getElementById('devisFileSize').textContent = formatFileSize(file.size);
    document.getElementById('devisFilePreview').style.display = 'flex';
    uploadZone.classList.add('has-file');
    document.getElementById('uploadStatus').className = 'upload-status';
  });

  // Drag events
  ['dragenter', 'dragover'].forEach(event => {
    uploadZone.addEventListener(event, function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add('dragover');
    });
  });
  
  ['dragleave', 'drop'].forEach(event => {
    uploadZone.addEventListener(event, function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('dragover');
    });
  });
  
  uploadZone.addEventListener('drop', function(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
});

async function uploadDevis() {
  if (!currentDevisRequestId) return;
  
  const fileInput = document.getElementById('devisFileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    showUploadStatus('Veuillez sélectionner un fichier PDF.', 'failed');
    return;
  }
  
  if (file.type !== 'application/pdf') {
    showUploadStatus('Seuls les fichiers PDF sont acceptés.', 'failed');
    return;
  }
  
  const supabase = window.__supabase?.getClient();
  if (!supabase) {
    showUploadStatus('Supabase non configuré.', 'failed');
    return;
  }
  
  const btn = document.getElementById('devisUploadBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Téléversement...';
  btn.disabled = true;
  
  // Show uploading status
  showUploadStatus('Téléversement en cours...', 'uploading');
  updateProgress(10);
  
  try {
    // Simulate progress
    const progressInterval = setInterval(() => {
      const fill = document.getElementById('progressFill');
      const current = parseInt(fill?.style.width || '10');
      if (current < 80) updateProgress(current + 10);
    }, 300);

    // Upload file to Supabase Storage
    const filePath = `devis/${currentDevisRequestId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DEVIS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    clearInterval(progressInterval);
    
    if (uploadError) throw uploadError;
    
    updateProgress(90);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(DEVIS_BUCKET)
      .getPublicUrl(filePath);
    
    // Update the request with the quotation URL
    const { error: updateError } = await supabase
      .from('requests')
      .update({ quotation_url: publicUrl })
      .eq('id', currentDevisRequestId);
    
    if (updateError) throw updateError;
    
    updateProgress(100);
    
    // Show success
    showUploadStatus('Devis téléversé avec succès !', 'success');
    
    // Refresh the requests table
    await loadRequests();
    
    // Close modal after a short delay
    setTimeout(() => {
      closeDevisModal();
      showToast('Devis téléversé avec succès !');
    }, 1000);
    
  } catch (error) {
    console.error('Error uploading devis:', error);
    showUploadStatus('Erreur: ' + error.message, 'failed');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ===== FILTERING =====

function filterUsers() {
  const searchTerm = document.getElementById('userSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#usersTableBody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function filterRequests() {
  const searchTerm = document.getElementById('requestSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#requestsTableBody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusBadge(status) {
  const statusMap = {
    'pending': '<span class="status-badge status-review" data-status="pending">En attente</span>',
    'in_progress': '<span class="status-badge status-progress" data-status="in_progress">En cours</span>',
    'approved': '<span class="status-badge status-completed" data-status="approved">Validé</span>',
    'rejected': '<span class="status-badge status-cancelled" data-status="rejected">Refusé</span>',
    'completed': '<span class="status-badge status-completed" data-status="completed">Terminé</span>'
  };
  return statusMap[status] || '<span class="status-badge" data-status="' + escapeHtml(status) + '">' + escapeHtml(status) + '</span>';
}

async function viewUserDetails(userId) {
  try {
    const supabase = window.__supabase?.getClient();
    if (!supabase) {
      alert('Supabase non configuré.');
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!user) {
      alert('Utilisateur non trouvé.');
      return;
    }

    const content = document.getElementById('userDetailsContent');
    content.innerHTML = `
      <div class="detail-row">
        <div class="detail-label">Nom complet</div>
        <div class="detail-value">${escapeHtml(user.full_name || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Email</div>
        <div class="detail-value">${escapeHtml(user.email)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Établissement</div>
        <div class="detail-value">${escapeHtml(user.school_name || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Téléphone</div>
        <div class="detail-value">${escapeHtml(user.phone || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Rôle</div>
        <div class="detail-value">${escapeHtml(user.role || 'user')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Date d'inscription</div>
        <div class="detail-value">${formatDate(user.created_at)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Dernière mise à jour</div>
        <div class="detail-value">${formatDate(user.updated_at)}</div>
      </div>
    `;

    document.getElementById('userDetailsModal').classList.add('open');
  } catch (error) {
    console.error('Error loading user details:', error);
    alert('Erreur lors du chargement des détails de l\'utilisateur.');
  }
}

function closeUserModal() {
  document.getElementById('userDetailsModal').classList.remove('open');
}

async function viewRequestDetails(requestId) {
  try {
    const supabase = window.__supabase?.getClient();
    if (!supabase) {
      alert('Supabase non configuré.');
      return;
    }

    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) throw error;
    if (!request) {
      alert('Demande non trouvée.');
      return;
    }

    const statusBadge = getStatusBadge(request.status);
    const hasDevis = request.quotation_url && request.quotation_url.trim() !== '';
    const content = document.getElementById('requestDetailsContent');
    content.innerHTML = `
      <div class="detail-row">
        <div class="detail-label">Numéro de demande</div>
        <div class="detail-value"><strong>${escapeHtml(request.request_number || '#' + request.id)}</strong></div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Service</div>
        <div class="detail-value">${escapeHtml(request.service_name || request.service_key || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Établissement</div>
        <div class="detail-value">${escapeHtml(request.school_name || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Ville</div>
        <div class="detail-value">${escapeHtml(request.city || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Contact</div>
        <div class="detail-value">${escapeHtml(request.contact_name || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Téléphone</div>
        <div class="detail-value">${escapeHtml(request.contact_phone || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Email</div>
        <div class="detail-value">${escapeHtml(request.contact_email || 'N/A')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Description</div>
        <div class="detail-value">${escapeHtml(request.description || 'Aucune description')}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Date souhaitée</div>
        <div class="detail-value">${request.requested_date ? new Date(request.requested_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Statut</div>
        <div class="detail-value">${statusBadge}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Devis</div>
        <div class="detail-value">${hasDevis ? `<a href="${escapeHtml(request.quotation_url)}" target="_blank" style="color: #2563eb; font-weight: 600;"><i class="fas fa-file-pdf"></i> Voir le devis</a>` : '<span style="color: #94a3b8;">Aucun devis</span>'}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Date de soumission</div>
        <div class="detail-value">${formatDate(request.created_at)}</div>
      </div>
    `;

    document.getElementById('requestDetailsModal').classList.add('open');
  } catch (error) {
    console.error('Error loading request details:', error);
    alert('Erreur lors du chargement des détails de la demande.');
  }
}

function closeRequestModal() {
  document.getElementById('requestDetailsModal').classList.remove('open');
}

// ===== RECEIPT GENERATION =====
let currentReceiptRequestId = null;

async function generateReceipt(requestId) {
  currentReceiptRequestId = requestId;
  
  try {
    const supabase = window.__supabase?.getClient();
    if (!supabase) {
      alert('Supabase non configuré.');
      return;
    }

    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) throw error;
    if (!request) {
      alert('Demande non trouvée.');
      return;
    }

    const receiptContent = document.getElementById('receiptContent');
    const receiptNumber = request.request_number || '#' + request.id.substring(0, 8).toUpperCase();
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    receiptContent.innerHTML = `
      <div class="receipt-header">
        <img src="images/Assets/logo2.png" alt="SMARTSERVICES Schools" class="receipt-logo">
        <div class="receipt-title">
          <h1>SMARTSERVICES Schools</h1>
          <p>Reçu de Service</p>
        </div>
      </div>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-info">
        <div class="receipt-section">
          <h3>Informations du reçu</h3>
          <div class="receipt-row">
            <span>Numéro de reçu:</span>
            <strong>${receiptNumber}</strong>
          </div>
          <div class="receipt-row">
            <span>Date d'émission:</span>
            <span>${currentDate}</span>
          </div>
          <div class="receipt-row">
            <span>Statut:</span>
            <span class="status-badge ${getStatusBadgeClass(request.status)}">${getStatusLabel(request.status)}</span>
          </div>
        </div>

        <div class="receipt-section">
          <h3>Informations du client</h3>
          <div class="receipt-row">
            <span>Établissement:</span>
            <strong>${escapeHtml(request.school_name || 'N/A')}</strong>
          </div>
          <div class="receipt-row">
            <span>Contact:</span>
            <span>${escapeHtml(request.contact_name || 'N/A')}</span>
          </div>
          <div class="receipt-row">
            <span>Ville:</span>
            <span>${escapeHtml(request.city || 'N/A')}</span>
          </div>
          <div class="receipt-row">
            <span>Téléphone:</span>
            <span>${escapeHtml(request.contact_phone || 'N/A')}</span>
          </div>
          <div class="receipt-row">
            <span>Email:</span>
            <span>${escapeHtml(request.contact_email || 'N/A')}</span>
          </div>
        </div>

        <div class="receipt-section">
          <h3>Détails du service</h3>
          <div class="receipt-row">
            <span>Service demandé:</span>
            <strong>${escapeHtml(request.service_name || request.service_key || 'N/A')}</strong>
          </div>
          <div class="receipt-row">
            <span>Date souhaitée:</span>
            <span>${request.requested_date ? new Date(request.requested_date).toLocaleDateString('fr-FR') : 'Non spécifiée'}</span>
          </div>
          ${request.description ? `
          <div class="receipt-row receipt-description">
            <span>Description:</span>
            <p>${escapeHtml(request.description)}</p>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="receipt-divider"></div>
      
      <div class="receipt-footer">
        <p>Merci pour votre confiance!</p>
        <p class="receipt-contact">Contact: contact@smartservices.ma | +212 5XX XX XX XX</p>
      </div>
    `;

    document.getElementById('receiptModal').classList.add('open');
  } catch (error) {
    console.error('Error generating receipt:', error);
    alert('Erreur lors de la génération du reçu.');
  }
}

function getStatusBadgeClass(status) {
  const classMap = {
    'pending': 'status-review',
    'in_progress': 'status-progress',
    'approved': 'status-completed',
    'rejected': 'status-cancelled',
    'completed': 'status-completed'
  };
  return classMap[status] || '';
}

function getStatusLabel(status) {
  const labelMap = {
    'pending': 'En attente',
    'in_progress': 'En cours',
    'approved': 'Validé',
    'rejected': 'Refusé',
    'completed': 'Terminé'
  };
  return labelMap[status] || status;
}

function closeReceiptModal() {
  document.getElementById('receiptModal').classList.remove('open');
  currentReceiptRequestId = null;
}

function printReceipt() {
  const receiptContent = document.getElementById('receiptContent').innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reçu - SMARTSERVICES Schools</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Nunito', sans-serif;
          padding: 2rem;
          color: #1e293b;
          line-height: 1.6;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .receipt-logo {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .receipt-title h1 {
          font-size: 1.75rem;
          color: #f97316;
          margin-bottom: 0.5rem;
        }
        .receipt-title p {
          font-size: 1.1rem;
          color: #64748b;
        }
        .receipt-divider {
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .receipt-section {
          margin-bottom: 1.5rem;
        }
        .receipt-section h3 {
          color: #f97316;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding: 0.5rem 0;
        }
        .receipt-row span:first-child {
          color: #64748b;
          font-weight: 600;
        }
        .receipt-row strong {
          color: #1e293b;
        }
        .receipt-description {
          flex-direction: column;
        }
        .receipt-description p {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 6px;
          color: #334155;
        }
        .receipt-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e5e7eb;
        }
        .receipt-footer p {
          margin: 0.5rem 0;
          color: #64748b;
        }
        .receipt-contact {
          font-size: 0.9rem;
        }
        @media print {
          body { padding: 0; }
          .receipt-header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      ${receiptContent}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}