/*
===========================================
KRISHYASETU FILE UPLOAD COMPONENTS
===========================================
JavaScript components for file upload and image handling
===========================================
*/

// ========================================
// FILE UPLOAD CLASS
// ========================================

class FileUpload {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            multiple: options.multiple || false,
            accept: options.accept || '*',
            maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB default
            maxFiles: options.maxFiles || 5,
            dragDrop: options.dragDrop !== false,
            preview: options.preview !== false,
            autoUpload: options.autoUpload || false,
            uploadUrl: options.uploadUrl || null,
            onFileSelect: options.onFileSelect || (() => {}),
            onFileRemove: options.onFileRemove || (() => {}),
            onUploadProgress: options.onUploadProgress || (() => {}),
            onUploadComplete: options.onUploadComplete || (() => {}),
            onUploadError: options.onUploadError || (() => {}),
            onValidationError: options.onValidationError || (() => {}),
            ...options
        };
        
        this.files = [];
        this.isUploading = false;
        
        this.init();
    }

    init() {
        this.createUploadArea();
        this.bindEvents();
    }

    createUploadArea() {
        const uploadHTML = `
            <div class="file-upload ${this.options.compact ? 'file-upload-compact' : ''} ${this.options.image ? 'file-upload-image' : ''} ${this.options.single ? 'file-upload-single' : ''}" id="file-upload-${Date.now()}">
                <div class="file-upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="file-upload-text">
                    <div class="file-upload-title">Drop files here or click to browse</div>
                    <div class="file-upload-subtitle">Support for images, documents, and more</div>
                    <div class="file-upload-hint">Maximum file size: ${this.formatFileSize(this.options.maxSize)}</div>
                </div>
                <input type="file" class="file-upload-input" ${this.options.multiple ? 'multiple' : ''} accept="${this.options.accept}">
                ${!this.options.compact ? '<button type="button" class="file-upload-button">Choose Files</button>' : ''}
            </div>
            <div class="file-preview" id="file-preview-${Date.now()}"></div>
            <div class="file-validation" id="file-validation-${Date.now()}" style="display: none;"></div>
        `;

        this.container.innerHTML = uploadHTML;
        this.uploadElement = this.container.querySelector('.file-upload');
        this.inputElement = this.container.querySelector('.file-upload-input');
        this.previewElement = this.container.querySelector('.file-preview');
        this.validationElement = this.container.querySelector('.file-validation');
    }

    bindEvents() {
        // File input change
        this.inputElement.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Click to upload
        this.uploadElement.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                this.inputElement.click();
            }
        });

        // Drag and drop
        if (this.options.dragDrop) {
            this.bindDragDropEvents();
        }
    }

    bindDragDropEvents() {
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadElement.addEventListener(eventName, preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadElement.addEventListener(eventName, () => {
                this.uploadElement.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadElement.addEventListener(eventName, () => {
                this.uploadElement.classList.remove('drag-over');
            });
        });

        this.uploadElement.addEventListener('drop', (e) => {
            this.handleFiles(e.dataTransfer.files);
        });
    }

    handleFiles(fileList) {
        const files = Array.from(fileList);
        
        // Validate files
        const validFiles = this.validateFiles(files);
        
        if (validFiles.length === 0) {
            return;
        }

        // Add files to list
        if (!this.options.multiple) {
            this.files = [];
            this.previewElement.innerHTML = '';
        }

        validFiles.forEach(file => {
            if (this.files.length >= this.options.maxFiles) {
                this.showValidation(`Maximum ${this.options.maxFiles} files allowed`, 'warning');
                return;
            }

            this.files.push(file);
            this.createFilePreview(file);
            this.options.onFileSelect(file);
        });

        // Auto upload if enabled
        if (this.options.autoUpload && this.options.uploadUrl) {
            this.uploadFiles();
        }

        // Clear input
        this.inputElement.value = '';
    }

    validateFiles(files) {
        const validFiles = [];
        
        files.forEach(file => {
            // Check file size
            if (file.size > this.options.maxSize) {
                this.showValidation(`File "${file.name}" exceeds maximum size of ${this.formatFileSize(this.options.maxSize)}`, 'error');
                return;
            }

            // Check file type (if accept is specified and not *)
            if (this.options.accept && this.options.accept !== '*') {
                const acceptedTypes = this.options.accept.split(',').map(type => type.trim());
                const fileType = file.type;
                const fileName = file.name;
                
                const isAccepted = acceptedTypes.some(acceptType => {
                    if (acceptType.startsWith('.')) {
                        return fileName.toLowerCase().endsWith(acceptType.toLowerCase());
                    }
                    if (acceptType.includes('*')) {
                        const baseType = acceptType.split('/')[0];
                        return fileType.startsWith(baseType + '/');
                    }
                    return fileType === acceptType;
                });

                if (!isAccepted) {
                    this.showValidation(`File "${file.name}" is not an accepted file type`, 'error');
                    return;
                }
            }

            validFiles.push(file);
        });

        return validFiles;
    }

    createFilePreview(file) {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const isImage = file.type.startsWith('image/');

        const previewHTML = `
            <div class="file-preview-item" data-file-id="${fileId}">
                <div class="file-preview-thumbnail">
                    ${isImage ? 
                        `<img src="${URL.createObjectURL(file)}" alt="${file.name}">` :
                        `<div class="file-icon"><i class="${this.getFileIcon(file.type)}"></i></div>`
                    }
                </div>
                <div class="file-preview-info">
                    <div class="file-preview-name" title="${file.name}">${file.name}</div>
                    <div class="file-preview-details">
                        <span class="file-preview-size">${this.formatFileSize(file.size)}</span>
                        <span class="file-preview-type">${file.type || 'Unknown'}</span>
                    </div>
                    <div class="file-progress" id="progress-${fileId}" style="display: none;">
                        <div class="file-progress-bar">
                            <div class="file-progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="file-progress-text">
                            <span>Uploading...</span>
                            <span class="file-progress-percentage">0%</span>
                        </div>
                    </div>
                </div>
                <div class="file-preview-actions">
                    ${isImage ? `<button class="file-preview-action view" title="View">
                        <i class="fas fa-eye"></i>
                    </button>` : ''}
                    <button class="file-preview-action delete" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        this.previewElement.insertAdjacentHTML('beforeend', previewHTML);
        
        // Bind preview events
        const previewItem = this.previewElement.querySelector(`[data-file-id="${fileId}"]`);
        this.bindPreviewEvents(previewItem, file, fileId);
    }

    bindPreviewEvents(previewItem, file, fileId) {
        // View button (for images)
        const viewBtn = previewItem.querySelector('.view');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.viewImage(file);
            });
        }

        // Delete button
        const deleteBtn = previewItem.querySelector('.delete');
        deleteBtn.addEventListener('click', () => {
            this.removeFile(fileId, file, previewItem);
        });
    }

    viewImage(file) {
        const modal = new window.KrishyaSetu.Modal({
            title: file.name,
            content: `
                <div style="text-align: center;">
                    <img src="${URL.createObjectURL(file)}" alt="${file.name}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;">
                    <div style="margin-top: 16px; color: var(--text-secondary); font-size: 14px;">
                        <div><strong>Size:</strong> ${this.formatFileSize(file.size)}</div>
                        <div><strong>Type:</strong> ${file.type}</div>
                    </div>
                </div>
            `,
            size: 'large'
        });
        modal.open();
    }

    removeFile(fileId, file, previewItem) {
        // Remove from files array
        const index = this.files.findIndex(f => f === file);
        if (index > -1) {
            this.files.splice(index, 1);
        }

        // Remove preview
        previewItem.remove();

        // Revoke object URL if image
        if (file.type.startsWith('image/')) {
            URL.revokeObjectURL(file);
        }

        // Callback
        this.options.onFileRemove(file);

        // Clear validation if no files
        if (this.files.length === 0) {
            this.clearValidation();
        }
    }

    uploadFiles() {
        if (this.isUploading || !this.options.uploadUrl) {
            return;
        }

        this.isUploading = true;
        this.uploadElement.classList.add('loading');

        const formData = new FormData();
        this.files.forEach(file => {
            formData.append('files', file);
        });

        // Show progress for all files
        this.files.forEach(file => {
            const fileId = this.getFileId(file);
            const progressElement = document.getElementById(`progress-${fileId}`);
            if (progressElement) {
                progressElement.style.display = 'block';
            }
        });

        // Simulate upload (replace with actual fetch/axios call)
        this.simulateUpload(formData);
    }

    simulateUpload(formData) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                this.files.forEach(file => {
                    const fileId = this.getFileId(file);
                    const progressElement = document.getElementById(`progress-${fileId}`);
                    if (progressElement) {
                        progressElement.style.display = 'none';
                    }
                });

                this.isUploading = false;
                this.uploadElement.classList.remove('loading');
                this.uploadElement.classList.add('success');
                
                setTimeout(() => {
                    this.uploadElement.classList.remove('success');
                }, 2000);

                this.options.onUploadComplete(this.files);
                return;
            }

            // Update progress for all files
            this.files.forEach(file => {
                const fileId = this.getFileId(file);
                const progressFill = document.querySelector(`#progress-${fileId} .file-progress-fill`);
                const progressPercentage = document.querySelector(`#progress-${fileId} .file-progress-percentage`);
                
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
                if (progressPercentage) {
                    progressPercentage.textContent = `${Math.round(progress)}%`;
                }
            });

            this.options.onUploadProgress(progress);
        }, 200);
    }

    getFileId(file) {
        // Find file ID from preview elements
        const previewItems = this.previewElement.querySelectorAll('.file-preview-item');
        for (let item of previewItems) {
            const fileName = item.querySelector('.file-preview-name').textContent;
            if (fileName === file.name) {
                return item.dataset.fileId;
            }
        }
        return null;
    }

    showValidation(message, type = 'info') {
        this.validationElement.innerHTML = `
            <div class="file-validation-icon">
                <i class="fas ${this.getValidationIcon(type)}"></i>
            </div>
            <div class="file-validation-message">${message}</div>
        `;
        this.validationElement.className = `file-validation ${type}`;
        this.validationElement.style.display = 'flex';

        this.options.onValidationError(message, type);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.clearValidation();
        }, 5000);
    }

    clearValidation() {
        this.validationElement.style.display = 'none';
        this.validationElement.innerHTML = '';
    }

    getFileIcon(fileType) {
        const iconMap = {
            'image/': 'fas fa-image',
            'video/': 'fas fa-video',
            'audio/': 'fas fa-music',
            'application/pdf': 'fas fa-file-pdf',
            'application/msword': 'fas fa-file-word',
            'application/vnd.ms-excel': 'fas fa-file-excel',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
            'text/': 'fas fa-file-alt',
            'application/zip': 'fas fa-file-archive',
            'application/x-rar-compressed': 'fas fa-file-archive'
        };

        for (const [type, icon] of Object.entries(iconMap)) {
            if (fileType.startsWith(type)) {
                return icon;
            }
        }

        return 'fas fa-file';
    }

    getValidationIcon(type) {
        const icons = {
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            success: 'fa-check-circle'
        };
        return icons[type] || icons.info;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Public methods
    getFiles() {
        return this.files;
    }

    clearFiles() {
        this.files = [];
        this.previewElement.innerHTML = '';
        this.clearValidation();
        this.uploadElement.classList.remove('success', 'error');
    }

    setDisabled(disabled) {
        this.uploadElement.classList.toggle('disabled', disabled);
        this.inputElement.disabled = disabled;
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize file upload components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize file upload components
    document.querySelectorAll('[data-file-upload]').forEach(element => {
        const options = {
            multiple: element.dataset.multiple === 'true',
            accept: element.dataset.accept || '*',
            maxSize: parseInt(element.dataset.maxSize) || 10 * 1024 * 1024,
            maxFiles: parseInt(element.dataset.maxFiles) || 5,
            dragDrop: element.dataset.dragDrop !== 'false',
            preview: element.dataset.preview !== 'false',
            autoUpload: element.dataset.autoUpload === 'true',
            uploadUrl: element.dataset.uploadUrl || null,
            compact: element.dataset.compact === 'true',
            image: element.dataset.image === 'true',
            single: element.dataset.single === 'true'
        };

        new FileUpload(element, options);
    });
});

// Export for use in other modules
window.KrishyaSetu.FileUpload = FileUpload;
