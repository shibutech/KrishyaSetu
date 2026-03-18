/*
===========================================
KRISHYASETU CAMERA FUNCTIONALITY
===========================================
Complete camera integration with photo/video capture
===========================================
*/

class CameraFunctional {
    constructor() {
        this.stream = null;
        this.currentFacing = 'environment'; // 'user' for front camera
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.photoCount = 0;
    }

    // Open camera with full functionality
    async openCamera(options = {}) {
        const config = {
            video: {
                width: options.width || 1280,
                height: options.height || 720,
                facingMode: options.facingMode || 'environment'
            },
            audio: options.audio !== false
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(config);
            this.createCameraInterface(config);
            return true;
        } catch (error) {
            this.handleCameraError(error);
            return false;
        }
    }

    // Create full camera interface
    createCameraInterface(config) {
        const cameraHTML = `
            <div class="camera-functional-modal" id="camera-functional-modal">
                <div class="camera-functional-overlay"></div>
                <div class="camera-functional-content">
                    <div class="camera-header">
                        <h3>Camera</h3>
                        <div class="camera-controls">
                            <button class="btn btn-sm btn-secondary" id="switch-camera-btn">
                                <i class="fas fa-sync-alt"></i> Switch
                            </button>
                            <button class="btn btn-sm btn-secondary" id="camera-settings-btn">
                                <i class="fas fa-cog"></i> Settings
                            </button>
                            <button class="btn btn-sm btn-error camera-close-btn" id="close-camera-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="camera-main">
                        <div class="camera-preview-container">
                            <video id="camera-video" autoplay playsinline></video>
                            <canvas id="camera-canvas" hidden></canvas>
                            <div class="camera-overlay" id="camera-overlay">
                                <div class="focus-indicator" id="focus-indicator">
                                    <div class="focus-bracket"></div>
                                    <div class="focus-bracket"></div>
                                    <div class="focus-bracket"></div>
                                    <div class="focus-bracket"></div>
                                </div>
                                <div class="recording-indicator" id="recording-indicator" hidden>
                                    <div class="rec-dot"></div>
                                    <span>REC</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="camera-sidebar">
                            <div class="camera-modes">
                                <h4>Mode</h4>
                                <div class="mode-buttons">
                                    <button class="btn btn-secondary mode-btn active" data-mode="photo">
                                        <i class="fas fa-camera"></i> Photo
                                    </button>
                                    <button class="btn btn-secondary mode-btn" data-mode="video">
                                        <i class="fas fa-video"></i> Video
                                    </button>
                                    <button class="btn btn-secondary mode-btn" data-mode="scan">
                                        <i class="fas fa-qrcode"></i> Scan
                                    </button>
                                </div>
                            </div>
                            
                            <div class="camera-settings">
                                <h4>Settings</h4>
                                <div class="setting-group">
                                    <label>Flash</label>
                                    <button class="btn btn-sm btn-secondary" id="flash-toggle">
                                        <i class="fas fa-bolt"></i> Auto
                                    </button>
                                </div>
                                
                                <div class="setting-group">
                                    <label>Grid</label>
                                    <button class="btn btn-sm btn-secondary" id="grid-toggle">
                                        <i class="fas fa-th"></i> Off
                                    </button>
                                </div>
                                
                                <div class="setting-group">
                                    <label>Timer</label>
                                    <select id="timer-select" class="form-select">
                                        <option value="0">Off</option>
                                        <option value="3">3s</option>
                                        <option value="5">5s</option>
                                        <option value="10">10s</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="camera-info">
                                <h4>Info</h4>
                                <div class="info-item">
                                    <span>Photos: <strong id="photo-count">0</strong></span>
                                </div>
                                <div class="info-item">
                                    <span>Videos: <strong id="video-count">0</strong></span>
                                </div>
                                <div class="info-item">
                                    <span>Storage: <strong id="storage-used">0 MB</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="camera-footer">
                        <div class="capture-controls">
                            <button class="btn btn-primary btn-lg capture-btn" id="capture-photo-btn">
                                <i class="fas fa-camera"></i> Capture Photo
                            </button>
                            <button class="btn btn-error btn-lg record-btn" id="record-video-btn">
                                <i class="fas fa-video"></i> Record Video
                            </button>
                            <button class="btn btn-secondary btn-lg" id="gallery-btn">
                                <i class="fas fa-images"></i> Gallery
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', cameraHTML);
        this.bindCameraEvents();
        this.startVideoStream();
    }

    // Start video stream
    startVideoStream() {
        const video = document.getElementById('camera-video');
        if (video && this.stream) {
            video.srcObject = this.stream;
        }
    }

    // Bind camera events
    bindCameraEvents() {
        // Close camera
        document.getElementById('close-camera-btn').addEventListener('click', () => {
            this.closeCamera();
        });
        
        document.querySelector('.camera-functional-overlay').addEventListener('click', () => {
            this.closeCamera();
        });
        
        // Switch camera
        document.getElementById('switch-camera-btn').addEventListener('click', () => {
            this.switchCamera();
        });
        
        // Camera settings
        document.getElementById('camera-settings-btn').addEventListener('click', () => {
            this.openCameraSettings();
        });
        
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });
        
        // Flash toggle
        document.getElementById('flash-toggle').addEventListener('click', () => {
            this.toggleFlash();
        });
        
        // Grid toggle
        document.getElementById('grid-toggle').addEventListener('click', () => {
            this.toggleGrid();
        });
        
        // Record video
        document.getElementById('record-video-btn').addEventListener('click', () => {
            this.toggleVideoRecording();
        });
        
        // Gallery
        document.getElementById('gallery-btn').addEventListener('click', () => {
            this.openGallery();
        });
    }

    // Switch camera (front/back)
    async switchCamera() {
        this.currentFacing = this.currentFacing === 'environment' ? 'user' : 'environment';
        
        // Stop current stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        // Get new stream with different facing mode
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentFacing },
                audio: true
            });
            
            const video = document.getElementById('camera-video');
            video.srcObject = this.stream;
            
            this.showNotification('Camera switched', 'success');
        } catch (error) {
            this.showNotification('Failed to switch camera', 'error');
        }
    }

    // Switch mode (photo/video/scan)
    switchMode(mode) {
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Handle mode-specific UI changes
        switch(mode) {
            case 'photo':
                this.enablePhotoMode();
                break;
            case 'video':
                this.enableVideoMode();
                break;
            case 'scan':
                this.enableScanMode();
                break;
        }
    }

    // Enable photo mode
    enablePhotoMode() {
        document.getElementById('capture-photo-btn').style.display = 'inline-flex';
        document.getElementById('record-video-btn').style.display = 'none';
        document.querySelector('.focus-indicator').style.display = 'block';
    }

    // Enable video mode
    enableVideoMode() {
        document.getElementById('capture-photo-btn').style.display = 'none';
        document.getElementById('record-video-btn').style.display = 'inline-flex';
        document.querySelector('.focus-indicator').style.display = 'none';
    }

    // Enable scan mode
    enableScanMode() {
        // Integration with scanner components
        this.showNotification('Opening scanner...', 'info');
        this.closeCamera();
        // Open scanner modal
        if (window.scannerComponents) {
            window.scannerComponents.openScanner();
        }
    }

    // Toggle flash
    toggleFlash() {
        const flashBtn = document.getElementById('flash-toggle');
        const isOn = flashBtn.classList.contains('active');
        
        if (isOn) {
            flashBtn.classList.remove('active');
            flashBtn.innerHTML = '<i class="fas fa-bolt"></i> Off';
            // Turn off flash logic
        } else {
            flashBtn.classList.add('active');
            flashBtn.innerHTML = '<i class="fas fa-bolt"></i> On';
            // Turn on flash logic
        }
    }

    // Toggle grid
    toggleGrid() {
        const gridBtn = document.getElementById('grid-toggle');
        const overlay = document.getElementById('camera-overlay');
        const isOn = overlay.classList.contains('show-grid');
        
        if (isOn) {
            overlay.classList.remove('show-grid');
            gridBtn.innerHTML = '<i class="fas fa-th"></i> Off';
        } else {
            overlay.classList.add('show-grid');
            gridBtn.innerHTML = '<i class="fas fa-th"></i> On';
        }
    }

    // Capture photo
    capturePhoto() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Apply timer delay if set
        const timerValue = document.getElementById('timer-select').value;
        if (timerValue > 0) {
            setTimeout(() => {
                this.doCapturePhoto(context, canvas, video);
            }, timerValue * 1000);
        } else {
            this.doCapturePhoto(context, canvas, video);
        }
    }

    // Do the actual photo capture
    doCapturePhoto(context, canvas, video) {
        context.drawImage(video, 0, 0);
        
        // Add capture effect
        const overlay = document.getElementById('camera-overlay');
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        
        setTimeout(() => {
            overlay.style.backgroundColor = 'transparent';
        }, 200);
        
        // Convert to blob and save
        canvas.toBlob(blob => {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.savePhoto(file);
        }, 'image/jpeg', 0.9);
    }

    // Save photo
    savePhoto(file) {
        // Save to local storage or upload
        this.photoCount++;
        this.updatePhotoCount();
        
        // Show preview
        this.showPhotoPreview(file);
        
        // Add to file manager
        if (window.fileManager) {
            window.fileManager.addFileToList({
                id: Date.now(),
                file: file,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                uploaded: true,
                progress: 100
            });
        }
        
        this.showNotification('Photo captured successfully', 'success');
    }

    // Toggle video recording
    toggleVideoRecording() {
        if (this.isRecording) {
            this.stopVideoRecording();
        } else {
            this.startVideoRecording();
        }
    }

    // Start video recording
    startVideoRecording() {
        this.recordedChunks = [];
        
        const options = {
            mimeType: 'video/webm;codecs=vp9,opus'
        };
        
        try {
            this.mediaRecorder = new MediaRecorder(this.stream, options);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                this.saveVideo(blob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            document.getElementById('record-video-btn').innerHTML = '<i class="fas fa-stop"></i> Stop';
            document.getElementById('record-video-btn').classList.add('recording');
            document.getElementById('recording-indicator').hidden = false;
            
        } catch (error) {
            this.showNotification('Failed to start recording', 'error');
        }
    }

    // Stop video recording
    stopVideoRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update UI
            document.getElementById('record-video-btn').innerHTML = '<i class="fas fa-video"></i> Record Video';
            document.getElementById('record-video-btn').classList.remove('recording');
            document.getElementById('recording-indicator').hidden = true;
        }
    }

    // Save video
    saveVideo(blob) {
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        
        // Add to file manager
        if (window.fileManager) {
            window.fileManager.addFileToList({
                id: Date.now(),
                file: file,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                uploaded: true,
                progress: 100
            });
        }
        
        this.showNotification('Video saved successfully', 'success');
    }

    // Show photo preview
    showPhotoPreview(file) {
        const previewHTML = `
            <div class="photo-preview-toast" id="photo-preview-toast">
                <div class="preview-thumbnail">
                    <img src="${URL.createObjectURL(file)}" alt="Preview">
                </div>
                <div class="preview-info">
                    <span>Photo captured</span>
                    <button class="btn btn-sm btn-secondary" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', previewHTML);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            const toast = document.getElementById('photo-preview-toast');
            if (toast) toast.remove();
        }, 3000);
    }

    // Open gallery
    openGallery() {
        // Integration with file manager gallery
        if (window.fileManager) {
            window.fileManager.openFileManager();
        } else {
            this.showNotification('Gallery not available', 'warning');
        }
    }

    // Open camera settings
    openCameraSettings() {
        const settingsModal = `
            <div class="camera-settings-modal" id="camera-settings-modal">
                <div class="settings-overlay"></div>
                <div class="settings-content">
                    <div class="settings-header">
                        <h3>Camera Settings</h3>
                        <button class="settings-close" id="close-settings">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="settings-body">
                        <div class="setting-group">
                            <label>Resolution</label>
                            <select id="resolution-select" class="form-select">
                                <option value="640x480">480p (640x480)</option>
                                <option value="1280x720" selected>720p (1280x720)</option>
                                <option value="1920x1080">1080p (1920x1080)</option>
                                <option value="3840x2160">4K (3840x2160)</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Frame Rate</label>
                            <select id="framerate-select" class="form-select">
                                <option value="15">15 fps</option>
                                <option value="24">24 fps</option>
                                <option value="30" selected>30 fps</option>
                                <option value="60">60 fps</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Quality</label>
                            <select id="quality-select" class="form-select">
                                <option value="0.5">Low</option>
                                <option value="0.7" selected>Medium</option>
                                <option value="0.9">High</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Audio</label>
                            <div class="toggle-switch">
                                <input type="checkbox" id="audio-toggle" checked>
                                <label for="audio-toggle" class="toggle-slider"></label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-footer">
                        <button class="btn btn-secondary" id="reset-settings">
                            <i class="fas fa-undo"></i> Reset to Default
                        </button>
                        <button class="btn btn-primary" id="save-settings">
                            <i class="fas fa-save"></i> Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', settingsModal);
        this.bindSettingsEvents();
    }

    // Bind settings events
    bindSettingsEvents() {
        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('camera-settings-modal').remove();
        });
        
        // Settings overlay click
        const cameraSettingsModal = document.getElementById('camera-settings-modal');
        const settingsOverlay = document.querySelector('.settings-overlay');
        
        if (cameraSettingsModal && settingsOverlay) {
            settingsOverlay.addEventListener('click', () => {
                if (cameraSettingsModal) cameraSettingsModal.remove();
            });
        }
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveCameraSettings();
        });
        
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetCameraSettings();
        });
    }

    // Save camera settings
    saveCameraSettings() {
        const settings = {
            resolution: document.getElementById('resolution-select').value,
            framerate: document.getElementById('framerate-select').value,
            quality: document.getElementById('quality-select').value,
            audio: document.getElementById('audio-toggle').checked
        };
        
        localStorage.setItem('cameraSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully', 'success');
        document.getElementById('camera-settings-modal').remove();
    }

    // Reset camera settings
    resetCameraSettings() {
        localStorage.removeItem('cameraSettings');
        this.showNotification('Settings reset to default', 'info');
        document.getElementById('camera-settings-modal').remove();
    }

    // Update photo count
    updatePhotoCount() {
        const countElement = document.getElementById('photo-count');
        if (countElement) {
            countElement.textContent = this.photoCount;
        }
    }

    // Handle camera errors
    handleCameraError(error) {
        let errorMessage = 'Camera access failed';
        
        switch(error.name) {
            case 'NotAllowedError':
                errorMessage = 'Camera permission denied. Please allow camera access.';
                break;
            case 'NotFoundError':
                errorMessage = 'No camera device found.';
                break;
            case 'NotSupportedError':
                errorMessage = 'Camera not supported by this browser.';
                break;
            case 'NotReadableError':
                errorMessage = 'Camera is already in use by another application.';
                break;
            case 'OverconstrainedError':
                errorMessage = 'Camera constraints not satisfied.';
                break;
        }
        
        this.showNotification(errorMessage, 'error');
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = `
            <div class="camera-notification ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', notification);
        
        setTimeout(() => {
            const notif = document.querySelector('.camera-notification');
            if (notif) notif.remove();
        }, 3000);
    }

    // Close camera
    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        if (this.mediaRecorder && this.isRecording) {
            this.stopVideoRecording();
        }
        
        const modal = document.getElementById('camera-functional-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Global camera instance
window.cameraFunctional = new CameraFunctional();
