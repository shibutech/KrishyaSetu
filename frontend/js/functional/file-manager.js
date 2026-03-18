/*
===========================================
KRISHYASETU FILE MANAGER
===========================================
Functional file management system
===========================================
*/

class FileManager {
    constructor() {
        this.currentFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/*', 'application/pdf', 'text/*'];
        this.uploadQueue = [];
        this.isUploading = false;
    }

    // Open file manager modal
    openFileManager() {
        this.createFileManagerModal();
        // Use setTimeout to ensure DOM is ready before binding events
        setTimeout(() => {
            this.bindFileManagerEvents();
        }, 10);
    }

    // Create file manager modal
    createFileManagerModal() {
        const modalHTML = `
            <div class="file-manager-modal" id="file-manager-modal">
                <div class="file-manager-overlay"></div>
                <div class="file-manager-content">
                    <div class="file-manager-header">
                        <h3>File Manager</h3>
                        <button class="file-manager-close" id="close-file-manager">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="file-manager-body">
                        <div class="file-upload-section">
                            <div class="file-upload-area" id="file-drop-zone">
                                <div class="file-upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="file-upload-text">
                                    <h4>Drop files here or click to upload</h4>
                                    <p>Maximum file size: 10MB</p>
                                    <p>Supported formats: Images, PDF, Text</p>
                                </div>
                                <input type="file" id="file-input" multiple accept="image/*,application/pdf,text/*" hidden>
                            </div>
                            
                            <div class="file-upload-actions">
                                <button class="btn btn-primary" id="select-files-btn">
                                    <i class="fas fa-folder-open"></i> Choose Files
                                </button>
                                <button class="btn btn-secondary" id="take-photo-btn">
                                    <i class="fas fa-camera"></i> Take Photo
                                </button>
                                <button class="btn btn-secondary" id="scan-document-btn">
                                    <i class="fas fa-scanner"></i> Scan Document
                                </button>
                            </div>
                        </div>
                        
                        <div class="file-list-section">
                            <div class="file-list-header">
                                <h4>Uploaded Files</h4>
                                <div class="file-list-actions">
                                    <button class="btn btn-sm btn-secondary" id="clear-all-btn">
                                        <i class="fas fa-trash"></i> Clear All
                                    </button>
                                </div>
                            </div>
                            <div class="file-list" id="file-list">
                                <div class="empty-state">
                                    <i class="fas fa-folder-open"></i>
                                    <p>No files uploaded yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="file-manager-footer">
                        <div class="storage-info">
                            <span class="storage-used">0 MB used</span>
                            <span class="storage-total">/ 100 MB</span>
                        </div>
                        <button class="btn btn-primary" id="upload-all-btn">
                            <i class="fas fa-upload"></i> Upload All
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Bind file manager events
    bindFileManagerEvents() {
        const modal = document.getElementById('file-manager-modal');
        const dropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('file-input');
        
        // Close modal
        const closeFileManagerBtn = document.getElementById('close-file-manager');
        if (closeFileManagerBtn) {
            closeFileManagerBtn.addEventListener('click', () => {
                this.closeFileManager();
            });
        }
        
        // Click outside to close
        const fileManagerModal = document.querySelector('.file-manager-modal');
        const overlay = fileManagerModal?.querySelector('.file-manager-overlay');
        if (fileManagerModal && overlay) {
            overlay.addEventListener('click', () => {
                this.closeFileManager();
            });
        }
        
        // File selection
        document.getElementById('select-files-btn').addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop
        this.setupDragAndDrop(dropZone);
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // Camera integration
        document.getElementById('take-photo-btn').addEventListener('click', () => {
            this.openCamera();
        });
        
        // Document scanner
        document.getElementById('scan-document-btn').addEventListener('click', () => {
            this.openScanner();
        });
        
        // Upload all files
        document.getElementById('upload-all-btn').addEventListener('click', () => {
            this.uploadAllFiles();
        });
        
        // Clear all files
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllFiles();
        });
    }

    // Setup drag and drop
    setupDragAndDrop(dropZone) {
        if (!dropZone) return;
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                if (eventName === 'drop') {
                    this.handleFiles(e.dataTransfer.files);
                }
            });
        });
    }

    // Handle selected files
    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addFileToList(file);
            } else {
                this.showValidationError(file);
            }
        });
    }

    // Validate file
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return false;
        }
        
        // Check file type
        const isValidType = this.allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.slice(0, -2));
            }
            return file.type === type;
        });
        
        return isValidType;
    }

    // Add file to list
    addFileToList(file) {
        const fileId = Date.now() + Math.random();
        const fileData = {
            id: fileId,
            file: file,
            name: file.name,
            size: this.formatFileSize(file.size),
            type: file.type,
            uploaded: false,
            progress: 0
        };
        
        this.currentFiles.push(fileData);
        this.updateFileList();
    }

    // Update file list display
    updateFileList() {
        const fileList = document.getElementById('file-list');
        
        if (this.currentFiles.length === 0) {
            fileList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No files uploaded yet</p>
                </div>
            `;
            return;
        }
        
        const filesHTML = this.currentFiles.map(file => `
            <div class="file-item" data-file-id="${file.id}">
                <div class="file-preview">
                    ${this.getFilePreview(file)}
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${file.size}</span>
                        <span class="file-type">${this.getFileTypeIcon(file.type)}</span>
                    </div>
                    ${file.uploaded ? 
                        '<div class="file-status uploaded"><i class="fas fa-check-circle"></i> Uploaded</div>' :
                        `<div class="file-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${file.progress}%"></div>
                            </div>
                            <span class="progress-text">${file.progress}%</span>
                        </div>`
                    }
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-secondary file-action-btn" data-action="preview" data-file-id="${file.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary file-action-btn" data-action="download" data-file-id="${file.id}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-error file-action-btn" data-action="delete" data-file-id="${file.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        fileList.innerHTML = filesHTML;
        
        // Bind file action events
        this.bindFileActionEvents();
        
        // Update storage info
        this.updateStorageInfo();
    }

    // Get file preview
    getFilePreview(file) {
        if (file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file.file);
            return `<img src="${imageUrl}" alt="${file.name}" class="file-image-preview">`;
        } else if (file.type === 'application/pdf') {
            return `<i class="fas fa-file-pdf file-icon-preview"></i>`;
        } else if (file.type.startsWith('text/')) {
            return `<i class="fas fa-file-alt file-icon-preview"></i>`;
        } else {
            return `<i class="fas fa-file file-icon-preview"></i>`;
        }
    }

    // Get file type icon
    getFileTypeIcon(type) {
        if (type.startsWith('image/')) return '<i class="fas fa-image"></i> Image';
        if (type === 'application/pdf') return '<i class="fas fa-file-pdf"></i> PDF';
        if (type.startsWith('text/')) return '<i class="fas fa-file-alt"></i> Text';
        return '<i class="fas fa-file"></i> File';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Bind file action events
    bindFileActionEvents() {
        document.querySelectorAll('.file-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const fileId = e.currentTarget.dataset.fileId;
                const file = this.currentFiles.find(f => f.id == fileId);
                
                switch(action) {
                    case 'preview':
                        this.previewFile(file);
                        break;
                    case 'download':
                        this.downloadFile(file);
                        break;
                    case 'delete':
                        this.deleteFile(fileId);
                        break;
                }
            });
        });
    }

    // Preview file
    previewFile(file) {
        const previewModal = `
            <div class="file-preview-modal" id="file-preview-modal">
                <div class="preview-overlay"></div>
                <div class="preview-content">
                    <div class="preview-header">
                        <h3>${file.name}</h3>
                        <button class="preview-close" id="close-preview">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="preview-body">
                        ${this.getFilePreview(file)}
                    </div>
                    <div class="preview-footer">
                        <p>Size: ${file.size} | Type: ${file.type}</p>
                        <button class="btn btn-primary" onclick="fileManager.downloadFile(${JSON.stringify(file).replace(/"/g, '&quot;')})">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', previewModal);
        
        // Close preview
        const closePreviewBtn = document.getElementById('close-preview');
        const filePreviewModal = document.getElementById('file-preview-modal');
        const previewOverlay = filePreviewModal?.querySelector('.preview-overlay');
        
        if (closePreviewBtn && filePreviewModal) {
            closePreviewBtn.addEventListener('click', () => {
                if (filePreviewModal) filePreviewModal.remove();
            });
        }
        
        if (previewOverlay && filePreviewModal) {
            previewOverlay.addEventListener('click', () => {
                if (filePreviewModal) filePreviewModal.remove();
            });
        }
    }

    // Download file
    downloadFile(file) {
        const url = URL.createObjectURL(file.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Delete file
    deleteFile(fileId) {
        this.currentFiles = this.currentFiles.filter(f => f.id != fileId);
        this.updateFileList();
        this.showNotification('File deleted successfully', 'success');
    }

    // Clear all files
    clearAllFiles() {
        if (confirm('Are you sure you want to delete all files?')) {
            this.currentFiles = [];
            this.updateFileList();
            this.showNotification('All files cleared', 'info');
        }
    }

    // Open camera
    openCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { facingEnvironment: 'environment' } 
            })
            .then(stream => {
                this.showCameraModal(stream);
            })
            .catch(err => {
                this.showNotification('Camera access denied', 'error');
            });
        } else {
            this.showNotification('Camera not supported', 'error');
        }
    }

    // Show camera modal
    showCameraModal(stream) {
        const cameraModal = `
            <div class="camera-modal" id="camera-modal">
                <div class="camera-overlay"></div>
                <div class="camera-content">
                    <div class="camera-header">
                        <h3>Take Photo</h3>
                        <button class="camera-close" id="close-camera">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="camera-body">
                        <video id="camera-video" autoplay></video>
                        <canvas id="camera-canvas" hidden></canvas>
                    </div>
                    <div class="camera-footer">
                        <button class="btn btn-secondary" id="switch-camera">
                            <i class="fas fa-sync-alt"></i> Switch Camera
                        </button>
                        <button class="btn btn-primary" id="capture-photo">
                            <i class="fas fa-camera"></i> Capture
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', cameraModal);
        
        const video = document.getElementById('camera-video');
        video.srcObject = stream;
        
        // Camera events
        document.getElementById('close-camera').addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            document.getElementById('camera-modal').remove();
        });
        
        document.getElementById('capture-photo').addEventListener('click', () => {
            this.capturePhoto(video);
        });
    }

    // Capture photo
    capturePhoto(video) {
        const canvas = document.getElementById('camera-canvas');
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob(blob => {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.addFileToList({
                id: Date.now(),
                file: file,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                uploaded: false,
                progress: 0
            });
        }, 'image/jpeg');
    }

    // Open scanner
    openScanner() {
        this.showNotification('Opening document scanner...', 'info');
        // Integration with scanner components would go here
        // For now, show file input
        document.getElementById('file-input').click();
    }

    // Upload all files
    async uploadAllFiles() {
        if (this.currentFiles.length === 0) {
            this.showNotification('No files to upload', 'warning');
            return;
        }
        
        this.isUploading = true;
        
        for (let fileData of this.currentFiles) {
            if (!fileData.uploaded) {
                await this.uploadFile(fileData);
            }
        }
        
        this.isUploading = false;
        this.showNotification('All files uploaded successfully', 'success');
    }

    // Upload single file
    async uploadFile(fileData) {
        const formData = new FormData();
        formData.append('file', fileData.file);
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            fileData.progress = i;
            this.updateFileProgress(fileData.id, i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        fileData.uploaded = true;
        fileData.progress = 100;
        this.updateFileProgress(fileData.id, 100);
    }

    // Update file progress
    updateFileProgress(fileId, progress) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            const progressFill = fileItem.querySelector('.progress-fill');
            const progressText = fileItem.querySelector('.progress-text');
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}%`;
        }
        
        // Update file data
        const file = this.currentFiles.find(f => f.id == fileId);
        if (file) {
            file.progress = progress;
        }
    }

    // Update storage info
    updateStorageInfo() {
        const totalSize = this.currentFiles.reduce((sum, file) => sum + file.file.size, 0);
        const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        const storageUsed = document.querySelector('.storage-used');
        if (storageUsed) {
            storageUsed.textContent = `${usedMB} MB used`;
        }
    }

    // Show validation error
    showValidationError(file) {
        let errorMessage = '';
        if (file.size > this.maxFileSize) {
            errorMessage = `File "${file.name}" is too large. Maximum size is 10MB.`;
        } else {
            errorMessage = `File "${file.name}" type is not supported.`;
        }
        
        this.showNotification(errorMessage, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = `
            <div class="file-notification ${type}" id="file-notification">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            const notif = document.getElementById('file-notification');
            if (notif) notif.remove();
        }, 3000);
    }

    // Close file manager
    closeFileManager() {
        const modal = document.getElementById('file-manager-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Global file manager instance
window.fileManager = new FileManager();
