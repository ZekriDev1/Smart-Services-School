/**
 * SMARTSERVICES Schools - File Upload Component
 * Handles drag & drop, file preview, and validation
 */

class FileUpload {
  constructor(options = {}) {
    this.uploadArea = options.uploadArea;
    this.fileInput = options.fileInput;
    this.previewGrid = options.previewGrid;
    this.messageEl = options.messageEl;
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    this.allowedTypes = options.allowedTypes || ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
    this.files = [];
    
    this.init();
  }

  init() {
    if (!this.uploadArea || !this.fileInput) return;

    this.uploadArea.addEventListener('click', (e) => {
      if (e.target !== this.fileInput) {
        this.fileInput.click();
      }
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('dragover');
    });

    this.uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('dragover');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });
  }

  handleFiles(fileList) {
    const newFiles = Array.from(fileList);
    
    // Validate files
    newFiles.forEach(file => {
      if (!this.validateFile(file)) {
        return;
      }
      this.files.push(file);
    });

    this.updatePreview();
    this.showSuccess(`${this.files.length} fichier(s) sélectionné(s)`);
    
    // Reset input
    this.fileInput.value = '';
  }

  validateFile(file) {
    // Check file size
    if (file.size > this.maxSize) {
      this.showError(`Le fichier "${file.name}" dépasse la taille limite de 10MB`);
      return false;
    }

    // Check file type
    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.allowedTypes.includes(extension)) {
      this.showError(`Le type de fichier "${extension}" n'est pas autorisé`);
      return false;
    }

    return true;
  }

  updatePreview() {
    if (!this.previewGrid) return;

    this.previewGrid.innerHTML = '';

    this.files.forEach((file, index) => {
      const previewItem = this.createPreviewItem(file, index);
      this.previewGrid.appendChild(previewItem);
    });
  }

  createPreviewItem(file, index) {
    const item = document.createElement('div');
    item.className = 'file-preview-item';
    
    const isImage = file.type.startsWith('image/');
    const extension = file.name.split('.').pop().toLowerCase();
    
    // Create preview content
    let previewContent;
    if (isImage) {
      previewContent = document.createElement('img');
      previewContent.src = URL.createObjectURL(file);
      previewContent.className = 'file-preview-image';
      previewContent.alt = file.name;
    } else {
      // PDF or other file type
      previewContent = document.createElement('div');
      previewContent.className = 'file-preview-pdf';
      previewContent.innerHTML = `
        <i class="fas fa-file-${extension === 'pdf' ? 'pdf' : 'alt'}"></i>
        <span>${extension.toUpperCase()}</span>
      `;
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'file-preview-info';
    infoDiv.innerHTML = `
      <div class="file-preview-name" title="${file.name}">${file.name}</div>
      <div class="file-preview-size">${this.formatFileSize(file.size)}</div>
    `;

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      this.removeFile(index);
    };

    item.appendChild(previewContent);
    item.appendChild(infoDiv);
    item.appendChild(removeBtn);

    return item;
  }

  removeFile(index) {
    this.files.splice(index, 1);
    this.updatePreview();
    this.showSuccess(`${this.files.length} fichier(s) restant(s)`);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  showSuccess(message) {
    if (!this.messageEl) return;
    this.messageEl.className = 'upload-message success';
    this.messageEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    setTimeout(() => {
      this.messageEl.className = 'upload-message';
    }, 3000);
  }

  showError(message) {
    if (!this.messageEl) return;
    this.messageEl.className = 'upload-message error';
    this.messageEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    setTimeout(() => {
      this.messageEl.className = 'upload-message';
    }, 4000);
  }

  // Get files for upload
  getFiles() {
    return this.files;
  }

  // Clear all files
  clear() {
    this.files = [];
    this.updatePreview();
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  }
}

// Initialize file upload components
document.addEventListener('DOMContentLoaded', function() {
  // Index.html modal upload
  const modalUpload = new FileUpload({
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('modalRequestFiles'),
    previewGrid: document.getElementById('filePreviewGrid'),
    messageEl: document.getElementById('uploadMessage')
  });

  // App.html form upload
  const appUpload = new FileUpload({
    uploadArea: document.getElementById('uploadAreaApp'),
    fileInput: document.getElementById('requestFiles'),
    previewGrid: document.getElementById('filePreviewGridApp'),
    messageEl: document.getElementById('uploadMessageApp')
  });

  // Expose to global scope for form submission
  window.fileUploadModal = modalUpload;
  window.fileUploadApp = appUpload;
});