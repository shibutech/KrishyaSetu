/*
===========================================
KRISHYASETU MAIN FUNCTIONALITY
===========================================
Main integration point for all functional components
===========================================
*/

class MainFunctional {
    constructor() {
        this.components = {
            fileManager: null,
            camera: null,
            gallery: null,
            notifications: null
        };
        this.isInitialized = false;
    }

    // Initialize all functional components
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Initialize all components
            await this.initializeComponents();
            this.setupGlobalEventListeners();
            this.createGlobalUI();
            this.isInitialized = true;
            
            console.log('KrishyaSetu Functional Components Initialized');
        } catch (error) {
            console.warn('Failed to initialize functional components:', error);
        }
    }

    // Initialize individual components
    async initializeComponents() {
        // Initialize File Manager
        if (window.fileManager) {
            this.components.fileManager = window.fileManager;
        } else {
            this.components.fileManager = new FileManager();
            window.fileManager = this.components.fileManager;
        }

        // Initialize Camera
        if (window.cameraFunctional) {
            this.components.camera = window.cameraFunctional;
        } else {
            this.components.camera = new CameraFunctional();
            window.cameraFunctional = this.components.camera;
        }

        // Initialize Gallery
        if (window.galleryFunctional) {
            this.components.gallery = window.galleryFunctional;
        } else {
            this.components.gallery = new GalleryFunctional();
            window.galleryFunctional = this.components.gallery;
        }

        // Initialize Notifications
        if (window.notificationFunctional) {
            this.components.notifications = window.notificationFunctional;
            await this.components.notifications.init();
        } else {
            this.components.notifications = new NotificationFunctional();
            await this.components.notifications.init();
            window.notificationFunctional = this.components.notifications;
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });
    }

    // Create global UI elements
    createGlobalUI() {
        this.createFloatingActionButtons();
    }

    // Create floating action buttons
    createFloatingActionButtons() {
        const floatingButtonsHTML = `
            <div class="floating-action-buttons" id="floating-action-buttons">
                <button class="floating-btn" id="floating-file-manager" title="File Manager">
                    <i class="fas fa-folder"></i>
                </button>
                <button class="floating-btn" id="floating-camera" title="Camera">
                    <i class="fas fa-camera"></i>
                </button>
                <button class="floating-btn" id="floating-gallery" title="Gallery">
                    <i class="fas fa-images"></i>
                </button>
                <button class="floating-btn" id="floating-notifications" title="Notifications">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="floating-notification-badge" style="display: none;">0</span>
                </button>
                <button class="floating-btn" id="floating-settings" title="Settings">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', floatingButtonsHTML);
        this.bindFloatingButtonEvents();
    }

    // Bind floating button events
    bindFloatingButtonEvents() {
        const floatingFileManager = document.getElementById('floating-file-manager');
        if (floatingFileManager) {
            floatingFileManager.addEventListener('click', () => {
                this.components.fileManager.openFileManager();
            });
        }

        const floatingCamera = document.getElementById('floating-camera');
        if (floatingCamera) {
            floatingCamera.addEventListener('click', () => {
                this.components.camera.openCamera();
            });
        }

        const floatingGallery = document.getElementById('floating-gallery');
        if (floatingGallery) {
            floatingGallery.addEventListener('click', () => {
                this.components.gallery.openGallery();
            });
        }

        const floatingNotifications = document.getElementById('floating-notifications');
        if (floatingNotifications) {
            floatingNotifications.addEventListener('click', () => {
                this.components.notifications.showNotificationCenter();
            });
        }

        const floatingSettings = document.getElementById('floating-settings');
        if (floatingSettings) {
            floatingSettings.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const shortcuts = {
            'Ctrl+Shift+F': () => this.openGlobalSearch(),
            'Ctrl+Shift+N': () => this.components.fileManager.openFileManager(),
            'Ctrl+Shift+C': () => this.components.camera.openCamera(),
            'Ctrl+Shift+G': () => this.components.gallery.openGallery(),
            'Ctrl+Shift+I': () => this.components.notifications.showNotificationCenter(),
            'Ctrl+Shift+S': () => this.openSettingsModal(),
            'Escape': () => this.closeAllModals(),
            'F11': () => this.toggleFullscreen()
        };

        const key = [];
        if (e.ctrlKey) key.push('Ctrl');
        if (e.shiftKey) key.push('Shift');
        key.push(e.key);

        const shortcutKey = key.join('+');
        
        if (shortcuts[shortcutKey]) {
            e.preventDefault();
            shortcuts[shortcutKey]();
        }
    }

    // Handle online/offline status
    handleOnlineStatus(isOnline) {
        const statusIndicator = document.getElementById('online-status');
        
        if (!statusIndicator) {
            const statusHTML = `
                <div class="online-status-indicator ${isOnline ? 'online' : 'offline'}" id="online-status" title="${isOnline ? 'Online' : 'Offline'}">
                    <i class="fas fa-${isOnline ? 'wifi' : 'wifi-slash'}"></i>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', statusHTML);
        } else {
            statusIndicator.className = `online-status-indicator ${isOnline ? 'online' : 'offline'}`;
            statusIndicator.title = isOnline ? 'Online' : 'Offline';
            statusIndicator.innerHTML = `<i class="fas fa-${isOnline ? 'wifi' : 'wifi-slash'}"></i>`;
        }

        // Show notification for status change
        if (isOnline) {
            this.components.notifications.showSuccess('Connection Restored', 'You are back online');
        } else {
            this.components.notifications.showWarning('Connection Lost', 'You are currently offline');
        }
    }

    // Handle visibility change
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // User returned to the app
            this.components.notifications.markAllAsRead();
            this.hideFloatingButtons(false);
        } else {
            // User left the app
            this.showFloatingButtons(true);
        }
    }

    // Handle before unload
    handleBeforeUnload() {
        // Save any unsaved data
        this.saveAppState();
    }

    // Open global search
    openGlobalSearch() {
        const searchModal = `
            <div class="global-search-modal" id="global-search-modal">
                <div class="search-overlay"></div>
                <div class="search-content">
                    <div class="search-header">
                        <h3>Global Search</h3>
                        <button class="search-close" id="close-search">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="search-body">
                        <input type="text" id="global-search-input" class="form-input" placeholder="Search files, crops, weather..." autofocus>
                        <div class="search-filters">
                            <button class="btn btn-sm btn-secondary search-filter active" data-filter="all">All</button>
                            <button class="btn btn-sm btn-secondary search-filter" data-filter="files">Files</button>
                            <button class="btn btn-sm btn-secondary search-filter" data-filter="crops">Crops</button>
                            <button class="btn btn-sm btn-secondary search-filter" data-filter="weather">Weather</button>
                        </div>
                        <div class="search-results" id="search-results">
                            <div class="search-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Searching...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', searchModal);
        this.bindSearchEvents();
    }

    // Bind search events
    bindSearchEvents() {
        const searchInput = document.getElementById('global-search-input');
        const closeSearchBtn = document.getElementById('close-search');
        const globalSearchModal = document.getElementById('global-search-modal');
        const searchOverlay = document.querySelector('.search-overlay');
        
        if (closeSearchBtn && globalSearchModal) {
            closeSearchBtn.addEventListener('click', () => {
                if (globalSearchModal) globalSearchModal.remove();
            });
        }
        
        if (searchOverlay && globalSearchModal) {
            searchOverlay.addEventListener('click', () => {
                if (globalSearchModal) globalSearchModal.remove();
            });
        }

        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        document.querySelectorAll('.search-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setSearchFilter(e.target.dataset.filter);
            });
        });
    }

    // Perform search
    async performSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        const activeFilter = document.querySelector('.search-filter.active').dataset.filter;
        
        // Simulate search results
        setTimeout(() => {
            const results = this.getSearchResults(query, activeFilter);
            this.displaySearchResults(results);
        }, 500);
    }

    // Get search results
    getSearchResults(query, filter) {
        // Simulate different search results based on filter
        switch(filter) {
            case 'files':
                return this.components.fileManager.currentFiles.filter(file => 
                    file.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);
            case 'crops':
                return [
                    { name: 'Wheat', type: 'crop', info: 'Ready for harvest' },
                    { name: 'Rice', type: 'crop', info: 'Growing well' },
                    { name: 'Cotton', type: 'crop', info: 'Needs irrigation' }
                ].filter(crop => 
                    crop.name.toLowerCase().includes(query.toLowerCase())
                );
            case 'weather':
                return [
                    { name: 'Delhi', type: 'weather', temp: '28°C', condition: 'Sunny' },
                    { name: 'Mumbai', type: 'weather', temp: '32°C', condition: 'Humid' }
                ].filter(weather => 
                    weather.name.toLowerCase().includes(query.toLowerCase())
                );
            default:
                return [];
        }
    }

    // Display search results
    displaySearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result-item" data-type="${result.type}">
                <div class="result-icon">
                    <i class="fas fa-${this.getResultIcon(result.type)}"></i>
                </div>
                <div class="result-content">
                    <div class="result-name">${result.name}</div>
                    <div class="result-info">${result.info || ''}</div>
                </div>
                <div class="result-action">
                    <button class="btn btn-sm btn-secondary">Open</button>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
    }

    // Get result icon
    getResultIcon(type) {
        const icons = {
            file: 'file',
            crop: 'seedling',
            weather: 'cloud-sun'
        };
        return icons[type] || 'search';
    }

    // Set search filter
    setSearchFilter(filter) {
        document.querySelectorAll('.search-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        const searchInput = document.getElementById('global-search-input');
        searchInput.placeholder = `Search ${filter}...`;
    }

    // Clear search results
    clearSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Start typing to search...</p>
                </div>
            `;
        }
    }

    // Open settings modal
    openSettingsModal() {
        const settingsHTML = `
            <div class="settings-modal" id="settings-modal">
                <div class="settings-overlay"></div>
                <div class="settings-content">
                    <div class="settings-header">
                        <h3>Settings</h3>
                        <button class="settings-close" id="close-settings">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="settings-body">
                        <div class="settings-section">
                            <h4>Notifications</h4>
                            <div class="setting-item">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notification-sound" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Notification Sound</span>
                            </div>
                            <div class="setting-item">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notification-vibrate" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Vibration</span>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4>Appearance</h4>
                            <div class="setting-item">
                                <label>Theme</label>
                                <select id="theme-select" class="form-select">
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label>Language</label>
                                <select id="language-select" class="form-select">
                                    <option value="en">English</option>
                                    <option value="hi">हिंदी</option>
                                    <option value="pa">ਪੰਜਾਬੀ</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4>Data & Storage</h4>
                            <div class="setting-item">
                                <button class="btn btn-secondary" id="clear-cache">
                                    <i class="fas fa-broom"></i> Clear Cache
                                </button>
                            </div>
                            <div class="setting-item">
                                <button class="btn btn-secondary" id="export-data">
                                    <i class="fas fa-download"></i> Export Data
                                </button>
                            </div>
                            <div class="setting-item">
                                <button class="btn btn-error" id="reset-app">
                                    <i class="fas fa-undo"></i> Reset App
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="settings-footer">
                        <button class="btn btn-primary" id="save-settings">
                            <i class="fas fa-save"></i> Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', settingsHTML);
        this.bindSettingsEvents();
    }

    // Bind settings events
    bindSettingsEvents() {
        const closeSettingsBtn = document.getElementById('close-settings');
        const settingsModal = document.getElementById('settings-modal');
        const settingsOverlay = document.querySelector('.settings-overlay');
        
        if (closeSettingsBtn && settingsModal) {
            closeSettingsBtn.addEventListener('click', () => {
                if (settingsModal) settingsModal.remove();
            });
        }
        
        if (settingsOverlay && settingsModal) {
            settingsOverlay.addEventListener('click', () => {
                if (settingsModal) settingsModal.remove();
            });
        }
        
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        const clearCacheBtn = document.getElementById('clear-cache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
        
        const exportDataBtn = document.getElementById('export-data');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        const resetAppBtn = document.getElementById('reset-app');
        if (resetAppBtn) {
            resetAppBtn.addEventListener('click', () => {
                this.resetApp();
            });
        }
    }

    // Save settings
    saveSettings() {
        const settings = {
            notificationSound: document.getElementById('notification-sound').checked,
            notificationVibrate: document.getElementById('notification-vibrate').checked,
            theme: document.getElementById('theme-select').value,
            language: document.getElementById('language-select').value
        };

        localStorage.setItem('appSettings', JSON.stringify(settings));
        this.components.notifications.showSuccess('Settings Saved', 'Your preferences have been saved');
        document.getElementById('settings-modal').remove();
    }

    // Clear cache
    clearCache() {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            }).then(() => {
                this.components.notifications.showSuccess('Cache Cleared', 'Application cache has been cleared');
            });
        }
    }

    // Export data
    exportData() {
        const data = {
            settings: localStorage.getItem('appSettings'),
            files: this.components.fileManager.currentFiles,
            gallery: this.components.gallery.images,
            notifications: this.components.notifications.notifications,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `krishyasetu-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.components.notifications.showSuccess('Data Exported', 'Your data has been exported successfully');
    }

    // Reset app
    resetApp() {
        if (confirm('Are you sure you want to reset the app? This will clear all your data.')) {
            // Clear all localStorage
            localStorage.clear();
            
            // Clear all caches
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                });
            }
            
            // Reload the page
            window.location.reload();
        }
    }

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Show/hide floating buttons
    showFloatingButtons(show) {
        const floatingButtons = document.getElementById('floating-action-buttons');
        if (floatingButtons) {
            floatingButtons.style.display = show ? 'flex' : 'none';
        }
    }

    // Hide floating buttons
    hideFloatingButtons() {
        this.showFloatingButtons(false);
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('[id$="-modal"]');
        modals.forEach(modal => modal.remove());
    }

    // Save app state
    saveAppState() {
        const appState = {
            lastActive: Date.now(),
            activeComponents: Object.keys(this.components).filter(key => this.components[key] !== null),
            windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        sessionStorage.setItem('appState', JSON.stringify(appState));
    }

    // Get component instance
    getComponent(name) {
        return this.components[name] || null;
    }

    // Check if component is available
    isComponentAvailable(name) {
        return this.components[name] !== null;
    }
}

// Initialize main functional system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mainFunctional = new MainFunctional();
    window.mainFunctional.init();
});

// Export for global access
window.MainFunctional = MainFunctional;
