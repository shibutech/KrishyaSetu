/*
===========================================
KRISHYASETU NOTIFICATION FUNCTIONALITY
===========================================
Complete notification system with real-time updates
===========================================
*/

class NotificationFunctional {
    constructor() {
        this.notifications = [];
        this.permission = 'default';
        this.isSupported = 'Notification' in window;
        this.maxNotifications = 5;
        this.position = 'top-right';
        this.soundEnabled = true;
    }

    // Initialize notification system
    async init() {
        await this.requestPermission();
        this.setupServiceWorker();
        this.bindEvents();
    }

    // Request notification permission
    async requestPermission() {
        if (!this.isSupported) {
            console.log('Notifications not supported');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            this.permission = 'denied';
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission;
        } catch (error) {
            console.warn('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    // Setup service worker for PWA notifications
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                this.registration = registration;
                console.log('Service Worker registered');
            }).catch(error => {
                console.warn('Service Worker registration failed:', error);
            });
        }
    }

    // Show notification
    showNotification(options = {}) {
        const notificationOptions = {
            title: options.title || 'KrishyaSetu',
            body: options.body || 'You have a new notification',
            icon: options.icon || '/icons/icon-192.png',
            badge: options.badge || '/icons/badge.png',
            image: options.image || null,
            tag: options.tag || 'default',
            data: options.data || {},
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            vibrate: options.vibrate || [200, 100, 200],
            actions: options.actions || [],
            timestamp: options.timestamp || Date.now()
        };

        // Check permission and show appropriate notification
        if (this.permission === 'granted') {
            this.showBrowserNotification(notificationOptions);
        } else {
            this.showInAppNotification(notificationOptions);
        }
    }

    // Show browser notification
    showBrowserNotification(options) {
        try {
            const notification = new Notification(options.title, options);
            
            // Auto close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
            
            // Handle notification click
            notification.onclick = () => {
                this.handleNotificationClick(options);
                notification.close();
            };
            
            // Add to notifications list
            this.addNotificationToList({
                ...options,
                id: Date.now(),
                read: false,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.warn('Error showing browser notification:', error);
            this.showInAppNotification(options);
        }
    }

    // Show in-app notification
    showInAppNotification(options) {
        const notificationHTML = `
            <div class="in-app-notification ${options.type || 'info'}" data-notification-id="${Date.now()}">
                <div class="notification-content">
                    <div class="notification-icon">
                        <i class="fas fa-${this.getNotificationIcon(options.type)}"></i>
                    </div>
                    <div class="notification-body">
                        <div class="notification-title">${options.title}</div>
                        <div class="notification-message">${options.body}</div>
                        ${options.image ? `<img src="${options.image}" alt="" class="notification-image">` : ''}
                    </div>
                    <div class="notification-actions">
                        ${this.createActionButtons(options.actions)}
                    </div>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.addNotificationToDOM(notificationHTML);
        this.addNotificationToList({
            ...options,
            id: Date.now(),
            read: false,
            timestamp: Date.now()
        });
    }

    // Add notification to DOM
    addNotificationToDOM(html) {
        // Remove old notifications if limit exceeded
        this.cleanupOldNotifications();
        
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = `notification-container ${this.position}`;
            document.body.appendChild(container);
        }
        
        // Add new notification
        container.insertAdjacentHTML('afterbegin', html);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            const notification = container.firstElementChild;
            if (notification) {
                notification.classList.add('notification-removing');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Create action buttons
    createActionButtons(actions) {
        if (!actions || actions.length === 0) {
            return '';
        }
        
        return actions.map(action => `
            <button class="notification-action-btn" data-action="${action.action}">
                ${action.title}
            </button>
        `).join('');
    }

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            message: 'envelope',
            reminder: 'bell',
            weather: 'cloud-sun',
            market: 'chart-line',
            crop: 'seedling',
            alert: 'exclamation-triangle'
        };
        
        return icons[type] || icons.info;
    }

    // Handle notification click
    handleNotificationClick(options) {
        // Focus on the app window
        window.focus();
        
        // Handle custom actions
        if (options.data && options.data.url) {
            window.open(options.data.url, '_blank');
        }
        
        // Trigger custom handler if provided
        if (options.data && options.data.onClick) {
            window[options.data.onClick](options.data);
        }
    }

    // Add notification to list
    addNotificationToList(notification) {
        this.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.updateNotificationBadge();
    }

    // Update notification badge
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update browser badge
        if (this.registration && this.registration.showNotification) {
            this.registration.showNotification(`KrishyaSetu (${unreadCount})`, {
                body: `${unreadCount} unread notifications`,
                icon: '/icons/icon-192.png',
                badge: '/icons/badge.png',
                tag: 'badge'
            });
        }
        
        // Update in-app badge
        this.updateInAppBadge(unreadCount);
    }

    // Update in-app badge
    updateInAppBadge(count) {
        let badge = document.getElementById('notification-badge');
        
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'notification-badge';
            badge.className = 'notification-badge';
            badge.innerHTML = `<span class="badge-count">${count}</span>`;
            document.body.appendChild(badge);
        } else {
            badge.querySelector('.badge-count').textContent = count;
        }
        
        // Hide badge if no unread notifications
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'block';
        }
    }

    // Clean up old notifications
    cleanupOldNotifications() {
        const container = document.getElementById('notification-container');
        if (container) {
            const notifications = container.children;
            if (notifications.length >= this.maxNotifications) {
                // Remove oldest notifications
                for (let i = notifications.length - 1; i >= this.maxNotifications; i--) {
                    notifications[i].classList.add('notification-removing');
                    setTimeout(() => notifications[i].remove(), 300);
                }
            }
        }
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
        }
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        this.updateNotificationBadge();
        
        // Clear DOM notifications
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Show different types of notifications
    showSuccess(title, body, options = {}) {
        this.showNotification({ ...options, title, body, type: 'success' });
    }

    showError(title, body, options = {}) {
        this.showNotification({ ...options, title, body, type: 'error' });
    }

    showWarning(title, body, options = {}) {
        this.showNotification({ ...options, title, body, type: 'warning' });
    }

    showInfo(title, body, options = {}) {
        this.showNotification({ ...options, title, body, type: 'info' });
    }

    // Agriculture-specific notifications
    showCropAlert(cropName, disease, severity) {
        this.showNotification({
            title: 'Crop Alert',
            body: `${cropName}: ${disease} detected`,
            type: severity === 'high' ? 'error' : 'warning',
            icon: '/icons/crop-alert.png',
            data: {
                type: 'crop-alert',
                crop: cropName,
                disease: disease,
                severity: severity
            },
            actions: [
                {
                    action: 'view-details',
                    title: 'View Details'
                },
                {
                    action: 'get-treatment',
                    title: 'Get Treatment'
                }
            ],
            vibrate: [200, 100, 200, 100, 200]
        });
    }

    showWeatherAlert(weatherType, message, location) {
        this.showNotification({
            title: 'Weather Alert',
            body: `${message} in ${location}`,
            type: 'warning',
            icon: '/icons/weather-alert.png',
            data: {
                type: 'weather-alert',
                weatherType: weatherType,
                location: location
            },
            vibrate: [100, 200, 100]
        });
    }

    showMarketPriceAlert(crop, price, change) {
        const isIncrease = change > 0;
        
        this.showNotification({
            title: 'Market Price Update',
            body: `${crop}: ₹${price} (${isIncrease ? '↑' : '↓'} ${Math.abs(change)}%)`,
            type: isIncrease ? 'success' : 'warning',
            icon: '/icons/market-price.png',
            data: {
                type: 'market-price',
                crop: crop,
                price: price,
                change: change
            }
        });
    }

    showReminder(title, message, time) {
        this.showNotification({
            title: title,
            body: message,
            type: 'reminder',
            icon: '/icons/reminder.png',
            data: {
                type: 'reminder',
                time: time
            },
            actions: [
                {
                    action: 'snooze',
                    title: 'Snooze'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ],
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });
    }

    // Show notification center
    showNotificationCenter() {
        const centerHTML = `
            <div class="notification-center-modal" id="notification-center-modal">
                <div class="notification-center-overlay"></div>
                <div class="notification-center-content">
                    <div class="notification-center-header">
                        <h3>Notifications</h3>
                        <div class="center-controls">
                            <button class="btn btn-sm btn-secondary" id="mark-all-read-btn">
                                <i class="fas fa-check-double"></i> Mark All Read
                            </button>
                            <button class="btn btn-sm btn-error" id="clear-all-btn">
                                <i class="fas fa-trash"></i> Clear All
                            </button>
                            <button class="btn btn-sm btn-secondary center-close-btn" id="close-center-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="notification-filters">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="unread">Unread</button>
                        <button class="filter-btn" data-filter="alerts">Alerts</button>
                        <button class="filter-btn" data-filter="reminders">Reminders</button>
                    </div>
                    
                    <div class="notification-list" id="notification-list">
                        ${this.renderNotificationList()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', centerHTML);
        this.bindNotificationCenterEvents();
    }

    // Render notification list
    renderNotificationList(filter = 'all') {
        let filteredNotifications = this.notifications;
        
        switch(filter) {
            case 'unread':
                filteredNotifications = this.notifications.filter(n => !n.read);
                break;
            case 'alerts':
                filteredNotifications = this.notifications.filter(n => n.type === 'error' || n.type === 'warning');
                break;
            case 'reminders':
                filteredNotifications = this.notifications.filter(n => n.type === 'reminder');
                break;
        }
        
        if (filteredNotifications.length === 0) {
            return '<div class="empty-notifications">No notifications</div>';
        }
        
        return filteredNotifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-notification-id="${notification.id}">
                <div class="notification-item-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-title">${notification.title}</div>
                    <div class="notification-item-message">${notification.body}</div>
                    <div class="notification-item-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                <div class="notification-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="notificationFunctional.markAsRead(${notification.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="notificationFunctional.deleteNotification(${notification.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Bind notification center events
    bindNotificationCenterEvents() {
        const closeCenterBtn = document.getElementById('close-center-btn');
        if (closeCenterBtn) {
            closeCenterBtn.addEventListener('click', () => {
                const modal = document.getElementById('notification-center-modal');
                if (modal) modal.remove();
            });
        }
        
        const notificationCenterModal = document.getElementById('notification-center-modal');
        const notificationCenterOverlay = document.querySelector('.notification-center-overlay');
        if (notificationCenterModal && notificationCenterOverlay) {
            notificationCenterOverlay.addEventListener('click', () => {
                notificationCenterModal.remove();
            });
        }
        
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
        
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllNotifications();
                this.updateNotificationCenterList();
            });
        }
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterNotifications(e.target.dataset.filter);
            });
        });
    }

    // Filter notifications
    filterNotifications(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.updateNotificationCenterList(filter);
    }

    // Update notification center list
    updateNotificationCenterList(filter = 'all') {
        const list = document.getElementById('notification-list');
        if (list) {
            list.innerHTML = this.renderNotificationList(filter);
        }
    }

    // Mark all as read
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationBadge();
        this.updateNotificationCenterList();
    }

    // Delete notification
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationBadge();
        this.updateNotificationCenterList();
    }

    // Bind global events
    bindEvents() {
        // Handle notification clicks
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.notification-action-btn');
            if (actionBtn) {
                const action = actionBtn.dataset.action;
                const notificationId = parseInt(actionBtn.closest('[data-notification-id]').dataset.notificationId);
                const notification = this.notifications.find(n => n.id === notificationId);
                
                if (notification && notification.data) {
                    this.handleNotificationAction(action, notification.data);
                }
            }
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Mark notifications as read when user returns to app
                this.markAllAsRead();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showNotification({
                title: 'Connection Restored',
                body: 'You are back online',
                type: 'success'
            });
        });
        
        window.addEventListener('offline', () => {
            this.showNotification({
                title: 'Connection Lost',
                body: 'You are offline',
                type: 'error'
            });
        });
    }

    // Handle notification action
    handleNotificationAction(action, data) {
        switch(action) {
            case 'view-details':
                // Open crop details page
                window.location.href = `/crop-details?crop=${data.crop}`;
                break;
            case 'get-treatment':
                // Open treatment suggestions
                window.location.href = `/treatment?crop=${data.crop}&disease=${data.disease}`;
                break;
            case 'snooze':
                // Snooze reminder for 5 minutes
                setTimeout(() => {
                    this.showReminder(data.title, data.body, new Date(Date.now() + 5 * 60 * 1000));
                }, 5 * 60 * 1000);
                break;
            case 'dismiss':
                // Just mark as read
                break;
        }
    }

    // Format time
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)} minutes ago`;
        } else if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)} hours ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Global notification instance
window.notificationFunctional = new NotificationFunctional();
