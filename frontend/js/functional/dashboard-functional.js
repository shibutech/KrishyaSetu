/*
===========================================
KRISHYASETU DASHBOARD FUNCTIONALITY
===========================================
Complete dashboard functionality with all features
=======================================
*/

class DashboardFunctional {
    constructor() {
        this.crops = [];
        this.tasks = [];
        this.activities = [];
        this.notifications = [];
        this.isInitialized = false;
    }

    // Initialize dashboard functionality
    init() {
        if (this.isInitialized) return;

        this.loadStoredData();
        this.bindEvents();
        this.updateUI();
        this.isInitialized = true;
    }

    // Load stored data
    loadStoredData() {
        const storedCrops = localStorage.getItem('dashboardCrops');
        const storedTasks = localStorage.getItem('dashboardTasks');
        const storedActivities = localStorage.getItem('dashboardActivities');

        this.crops = storedCrops ? JSON.parse(storedCrops) : [];
        this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
        this.activities = storedActivities ? JSON.parse(storedActivities) : [];
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('dashboardCrops', JSON.stringify(this.crops));
        localStorage.setItem('dashboardTasks', JSON.stringify(this.tasks));
        localStorage.setItem('dashboardActivities', JSON.stringify(this.activities));
    }

    // Bind all dashboard events
    bindEvents() {
        // Quick Actions
        this.bindQuickActions();

        // Government Schemes
        this.bindSchemeEvents();

        // Notifications
        this.bindNotificationEvents();

        // Weather
        this.bindWeatherEvents();

        // Recent Activity
        this.updateRecentActivity();
    }

    // Bind Quick Actions events
    bindQuickActions() {
        // Add Crop Button
        const addCropBtn = document.getElementById('addCropBtn');
        if (addCropBtn) {
            addCropBtn.addEventListener('click', () => {
                this.openAddCropModal();
            });
        }

        // Add Task Button - Use TaskManager if available
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                if (window.taskManager) {
                    window.taskManager.showTaskForm();
                } else {
                    this.openAddTaskModal();
                }
            });
        }

        // File Manager Button
        const openFileManagerBtn = document.getElementById('openFileManagerBtn');
        if (openFileManagerBtn) {
            openFileManagerBtn.addEventListener('click', () => {
                if (window.fileManager) {
                    window.fileManager.openFileManager();
                }
            });
        }
    }

    // Open Add Crop Modal
    openAddCropModal() {
        const modalHTML = `
            <div class="modal-overlay" id="addCropModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Add New Crop</h3>
                        <button class="modal-close" id="closeCropModal">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Crop Name</label>
                            <select class="form-select" id="cropNameSelect">
                                <option value="">Select a crop</option>
                                <option value="wheat">Wheat (गेंहू)</option>
                                <option value="rice">Rice (धान)</option>
                                <option value="maize">Maize (मक्का)</option>
                                <option value="tomato">Tomato (टमाटर)</option>
                                <option value="pulses">Pulses (दाल)</option>
                                <option value="cotton">Cotton (कपास)</option>
                                <option value="sugarcane">Sugarcane (गन्ना)</option>
                                <option value="potato">Potato (आलू)</option>
                                <option value="onion">Onion (प्याज)</option>
                                <option value="mustard">Mustard (सरसों)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Sowing Date</label>
                            <input type="date" class="form-input" id="sowingDateInput">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Area (Acres)</label>
                            <input type="number" class="form-input" id="areaInput" placeholder="e.g. 5" min="0.1" step="0.1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Farm Location</label>
                            <input type="text" class="form-input" id="farmLocationInput" placeholder="Enter your farm location">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Expected Yield (tons)</label>
                            <input type="number" class="form-input" id="expectedYieldInput" placeholder="e.g. 2.5" min="0.1" step="0.1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="cropNotesInput" placeholder="Any additional notes..." rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelCropBtn">Cancel</button>
                        <button class="btn btn-primary" id="saveCropBtn">Save Crop</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setTimeout(() => document.getElementById('addCropModal').classList.add('active'), 10);
        this.bindCropModalEvents();
    }

    // Bind crop modal events
    bindCropModalEvents() {
        // Close modal
        document.getElementById('closeCropModal').addEventListener('click', () => {
            const modal = document.getElementById('addCropModal');
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        document.getElementById('cancelCropBtn').addEventListener('click', () => {
            const modal = document.getElementById('addCropModal');
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        // Save crop
        document.getElementById('saveCropBtn').addEventListener('click', () => {
            this.saveCrop();
        });

        // Close on overlay click
        const addCropModal = document.querySelector('#addCropModal');
        const cropModalOverlay = document.querySelector('.crop-modal-overlay');
        
        if (addCropModal && cropModalOverlay) {
            cropModalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'addCropModal') {
                    const modal = document.getElementById('addCropModal');
                    if (modal) modal.classList.remove('active');
                }
            });
        }
        setTimeout(() => {
            const modal = document.getElementById('addCropModal');
            if (modal) modal.remove();
        }, 300);
    }

    // Save crop
    saveCrop() {
        const cropData = {
            id: Date.now(),
            name: document.getElementById('cropNameSelect').value,
            sowingDate: document.getElementById('sowingDateInput').value,
            area: parseFloat(document.getElementById('areaInput').value) || 0,
            location: document.getElementById('farmLocationInput').value,
            expectedYield: parseFloat(document.getElementById('expectedYieldInput').value) || 0,
            notes: document.getElementById('cropNotesInput').value,
            addedDate: new Date().toISOString(),
            status: 'growing'
        };

        // Validation
        if (!cropData.name || !cropData.sowingDate || cropData.area <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Add to crops array
        this.crops.push(cropData);
        this.saveData();

        // Update UI
        this.updateCropHealthSummary();
        this.addActivity('crop_added', `Added ${cropData.name} crop (${cropData.area} acres)`);

        // Show notification
        this.showNotification(`Crop "${cropData.name}" added successfully!`, 'success');

        // Close modal
        document.getElementById('addCropModal').remove();
    }

    // Open Add Task Modal
    openAddTaskModal() {
        const modalHTML = `
            <div class="modal-overlay" id="addTaskModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Add New Task</h3>
                        <button class="modal-close" id="closeTaskModal">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Task Title</label>
                            <input type="text" class="form-input" id="taskTitleInput" placeholder="e.g. Water the wheat field">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Task Type</label>
                            <select class="form-select" id="taskTypeSelect">
                                <option value="watering">Watering</option>
                                <option value="fertilizing">Fertilizing</option>
                                <option value="pesticide">Pesticide Application</option>
                                <option value="harvesting">Harvesting</option>
                                <option value="planting">Planting</option>
                                <option value="weeding">Weeding</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Priority</label>
                            <select class="form-select" id="taskPrioritySelect">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Due Date</label>
                            <input type="date" class="form-input" id="taskDueDateInput">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Related Crop (Optional)</label>
                            <select class="form-select" id="taskCropSelect">
                                <option value="">Select crop (optional)</option>
                                ${this.crops.map(crop => `<option value="${crop.id}">${crop.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea class="form-input" id="taskDescriptionInput" placeholder="Task description..." rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelTaskBtn">Cancel</button>
                        <button class="btn btn-primary" id="saveTaskBtn">Save Task</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setTimeout(() => document.getElementById('addTaskModal').classList.add('active'), 10);
        this.bindTaskModalEvents();
    }

    // Bind task modal events
    bindTaskModalEvents() {
        // Close modal
        document.getElementById('closeTaskModal').addEventListener('click', () => {
            const modal = document.getElementById('addTaskModal');
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            const modal = document.getElementById('addTaskModal');
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        // Save task
        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        // Close on overlay click
        const addTaskModal = document.querySelector('#addTaskModal');
        const taskModalOverlay = document.querySelector('.task-modal-overlay');
        
        if (addTaskModal && taskModalOverlay) {
            taskModalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'addTaskModal') {
                    const modal = document.getElementById('addTaskModal');
                    if (modal) modal.classList.remove('active');
                }
            });
        }
        setTimeout(() => {
            const modal = document.getElementById('addTaskModal');
            if (modal) modal.remove();
        }, 300);
    }

    // Save task
    saveTask() {
        const taskData = {
            id: Date.now(),
            title: document.getElementById('taskTitleInput').value,
            type: document.getElementById('taskTypeSelect').value,
            priority: document.getElementById('taskPrioritySelect').value,
            dueDate: document.getElementById('taskDueDateInput').value,
            cropId: document.getElementById('taskCropSelect').value,
            description: document.getElementById('taskDescriptionInput').value,
            createdDate: new Date().toISOString(),
            status: 'pending'
        };

        // Validation
        if (!taskData.title || !taskData.dueDate) {
            this.showNotification('Please fill in task title and due date', 'error');
            return;
        }

        // Add to tasks array
        this.tasks.push(taskData);
        this.saveData();

        // Update UI
        this.addActivity('task_added', `Added task: ${taskData.title}`);

        // Show notification
        this.showNotification(`Task "${taskData.title}" added successfully!`, 'success');

        // Close modal
        document.getElementById('addTaskModal').remove();
    }

    // Bind Government Schemes events
    bindSchemeEvents() {
        // Ask Verdant buttons
        document.querySelectorAll('.ask-verdant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const schemeTitle = btn.getAttribute('data-scheme') || 
                                   (btn.closest('.scheme-item') && btn.closest('.scheme-item').querySelector('.scheme-title').textContent) ||
                                   (btn.closest('.scheme-card') && btn.closest('.scheme-card').querySelector('h4').textContent) ||
                                   'this';
                this.openChatbotWithMessage(`Tell me more about ${schemeTitle} scheme`);
            });
        });

        // View All Schemes button
        const viewAllSchemesBtn = document.getElementById('viewAllSchemesBtn');
        if (viewAllSchemesBtn) {
            viewAllSchemesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAllSchemesModal();
            });
        }
    }

    // Open chatbot with pre-filled message
    openChatbotWithMessage(message) {
        // Store message in sessionStorage for chatbot to use
        sessionStorage.setItem('chatbotPreMessage', message);

        // Navigate to chatbot
        window.location.href = 'chatbot.html';
    }

    // Open All Schemes Modal
    openAllSchemesModal() {
        const existingModal = document.getElementById('allSchemesModal');
        if (existingModal) {
            existingModal.classList.add('active');
            return;
        }

        const modalHTML = `
            <div class="modal-overlay" id="allSchemesModal">
                <div class="modal modal-large">
                    <div class="modal-header">
                        <h3 class="modal-title">🏛️ All Government Schemes</h3>
                        <button class="modal-close" id="closeAllSchemesModal">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="schemes-container">
                            <!-- Central Government Schemes -->
                            <div class="scheme-category">
                                <h4 class="category-title">🇮🇳 Central Government Schemes</h4>
                                
                                <div class="scheme-item">
                                    <h5 class="scheme-title">PM Kisan Samman Nidhi</h5>
                                    <p class="scheme-description">Financial support of ₹6,000 per year for small and marginal farmers</p>
                                    <div class="scheme-actions">
                                        <a href="https://pmkisan.gov.in/" target="_blank" class="scheme-link">Official Link →</a>
                                        <button class="ask-verdant-btn">Ask Verdant</button>
                                    </div>
                                </div>
                                
                                <div class="scheme-item">
                                    <h5 class="scheme-title">Pradhan Mantri Fasal Bima Yojana</h5>
                                    <p class="scheme-description">Insurance coverage for crop failure due to natural calamities, pests & diseases</p>
                                    <div class="scheme-actions">
                                        <a href="https://pmfby.gov.in/" target="_blank" class="scheme-link">Official Link →</a>
                                        <button class="ask-verdant-btn">Ask Verdant</button>
                                    </div>
                                </div>
                                
                                <div class="scheme-item">
                                    <h5 class="scheme-title">Soil Health Card Scheme</h5>
                                    <p class="scheme-description">Provides soil health cards to farmers with nutrient recommendations</p>
                                    <div class="scheme-actions">
                                        <a href="https://soilhealth.dac.gov.in/" target="_blank" class="scheme-link">Official Link →</a>
                                        <button class="ask-verdant-btn">Ask Verdant</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- State Government Schemes -->
                            <div class="scheme-category">
                                <h4 class="category-title">🏛️ State Government Schemes</h4>
                                
                                <div class="scheme-item">
                                    <h5 class="scheme-title">State Crop Insurance</h5>
                                    <p class="scheme-description">Additional crop insurance coverage provided by state governments</p>
                                    <div class="scheme-actions">
                                        <a href="#" target="_blank" class="scheme-link">Official Link →</a>
                                        <button class="ask-verdant-btn">Ask Verdant</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindAllSchemesModalEvents();
    }

    // Bind all schemes modal events
    bindAllSchemesModalEvents() {
        // Close modal
        document.getElementById('closeAllSchemesModal').addEventListener('click', () => {
            document.getElementById('allSchemesModal').remove();
        });

        // Ask Verdant buttons
        document.querySelectorAll('#allSchemesModal .ask-verdant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const schemeTitle = e.target.closest('.scheme-item').querySelector('.scheme-title').textContent;
                this.openChatbotWithMessage(`Tell me more about ${schemeTitle} scheme`);
                document.getElementById('allSchemesModal').remove();
            });
        });

        // Close on overlay click
        const allSchemesModal = document.querySelector('#allSchemesModal');
        const schemesModalOverlay = document.querySelector('.schemes-modal-overlay');
        
        if (allSchemesModal && schemesModalOverlay) {
            schemesModalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'allSchemesModal') {
                    const modal = document.getElementById('allSchemesModal');
                    if (modal) modal.remove();
                }
            });
        }
    }

    // Bind notification events
    bindNotificationEvents() {
        const notificationBellBtn = document.getElementById('notificationBellBtn');
        if (notificationBellBtn) {
            notificationBellBtn.addEventListener('click', () => {
                this.openNotificationDropdown();
            });
        }
    }

    // Open notification dropdown
    openNotificationDropdown() {
        // Close existing dropdown if open
        const existingDropdown = document.getElementById('notificationDropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const dropdownHTML = `
            <div class="notification-dropdown" id="notificationDropdown">
                <div class="notification-header">
                    <h4>Notifications</h4>
                    <div class="notification-actions">
                        <button class="btn btn-sm btn-secondary" id="markAllReadBtn">Mark All Read</button>
                        <button class="btn btn-sm btn-secondary" id="clearAllBtn">Clear All</button>
                    </div>
                </div>
                
                <div class="notification-list" id="notificationList">
                    ${this.renderNotifications()}
                </div>
            </div>
        `;

        // Position dropdown below notification bell
        const notificationBellBtn = document.getElementById('notificationBellBtn');
        if (notificationBellBtn) {
            notificationBellBtn.insertAdjacentHTML('afterend', dropdownHTML);
        } else {
            document.body.insertAdjacentHTML('beforeend', dropdownHTML);
        }

        // Bind dropdown events
        this.bindNotificationDropdownEvents();
    }

    // Render notifications
    renderNotifications() {
        if (this.notifications.length === 0) {
            return '<div class="no-notifications">No notifications</div>';
        }

        return this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                <div class="notification-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="dashboardFunctional.markAsRead(${notification.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="dashboardFunctional.deleteNotification(${notification.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            crop_added: 'seedling',
            task_added: 'tasks'
        };

        return icons[type] || 'info-circle';
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

    // Bind notification dropdown events
    bindNotificationDropdownEvents() {
        // Mark all as read
        document.getElementById('markAllReadBtn').addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Clear all
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllNotifications();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationDropdown');
            const notificationBell = document.getElementById('notificationBellBtn');

            if (dropdown && !dropdown.contains(e.target) && e.target !== notificationBell) {
                dropdown.remove();
            }
        });
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            // BUG 09 Fix: Actually update the DOM element
            const listEl = document.getElementById('notificationList');
            if (listEl) listEl.innerHTML = this.renderNotifications();
        }
    }

    // Mark all notifications as read
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationBadge();
        // BUG 09 Fix: Actually update the DOM element
        const listEl = document.getElementById('notificationList');
        if (listEl) listEl.innerHTML = this.renderNotifications();
    }

    // Delete notification
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationBadge();
        // BUG 09 Fix: Actually update the DOM element
        const listEl = document.getElementById('notificationList');
        if (listEl) listEl.innerHTML = this.renderNotifications();
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        this.updateNotificationBadge();
        // BUG 09 Fix: Actually update the DOM element
        const listEl = document.getElementById('notificationList');
        if (listEl) listEl.innerHTML = this.renderNotifications();
    }

    // Update notification badge
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('navbarNotificationBadge');

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Bind weather events
    bindWeatherEvents() {
        const weatherSearchBtn = document.getElementById('weatherSearchBtn');
        const weatherSearchInput = document.getElementById('weatherSearchInput');
        const weatherLocationBtn = document.getElementById('weatherLocationBtn');

        if (weatherSearchBtn && weatherSearchInput) {
            weatherSearchBtn.addEventListener('click', () => {
                const city = weatherSearchInput.value.trim();
                if (city) {
                    this.searchWeather(city);
                }
            });

            weatherSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const city = weatherSearchInput.value.trim();
                    if (city) {
                        this.searchWeather(city);
                    }
                }
            });
        }

        // Toggle "See More Detail" box
        const seeMoreWeatherBtn = document.getElementById('seeMoreWeatherBtn');
        const weatherExtendedDetails = document.getElementById('weatherExtendedDetails');
        if (seeMoreWeatherBtn && weatherExtendedDetails) {
            seeMoreWeatherBtn.addEventListener('click', () => {
                if (weatherExtendedDetails.style.display === 'none') {
                    weatherExtendedDetails.style.display = 'block';
                    seeMoreWeatherBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Details';
                } else {
                    weatherExtendedDetails.style.display = 'none';
                    seeMoreWeatherBtn.innerHTML = '<i class="fas fa-chevron-down"></i> See More Detail';
                }
            });
        }

        // Use My Location button — reverse geocode to get city name
        if (weatherLocationBtn) {
            weatherLocationBtn.addEventListener('click', () => {
                if (!navigator.geolocation) {
                    alert('Geolocation is not supported by your browser.');
                    return;
                }
                weatherLocationBtn.disabled = true;
                weatherLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        try {
                            const { latitude, longitude } = pos.coords;
                            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                                headers: { 'User-Agent': 'KrishyaSetuApp/1.0 (https://krishyasetu.app)' }
                            });
                            const geo = await resp.json();
                            const city = geo.address && (geo.address.city || geo.address.town || geo.address.village || geo.address.county);
                            if (city) {
                                if (weatherSearchInput) weatherSearchInput.value = city;
                                this.searchWeather(city);
                            }
                        } catch (e) {
                            alert('Could not detect location. Please enter city manually.');
                        } finally {
                            weatherLocationBtn.disabled = false;
                            weatherLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
                        }
                    },
                    () => {
                        alert('Location access denied. Please enter city manually.');
                        weatherLocationBtn.disabled = false;
                        weatherLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
                    }
                );
            });
        }
    }

    // Search weather for city
    async searchWeather(city) {
        const weatherSearchBtn = document.getElementById('weatherSearchBtn');
        const weatherSearchInput = document.getElementById('weatherSearchInput');

        // Indicate loading
        if (weatherSearchBtn) {
            weatherSearchBtn.textContent = 'Searching...';
            weatherSearchBtn.disabled = true;
        }

        try {
            // Fetch weather forecast from backend API proxy
            const response = await fetch(window.APP_CONFIG.WEATHER_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    city: city,
                    days: 14
                })
            });

            if (!response.ok) {
                throw new Error('City not found or API error');
            }

            const data = await response.json();
            
            // Handle AccuWeather API response format
            const location = data.location;
            const forecast = data.forecast;
            
            // Get current conditions from first day of forecast
            const currentDay = forecast.DailyForecasts[0];
            const current = {
                temp_c: (currentDay.Temperature.Maximum.Value + currentDay.Temperature.Minimum.Value) / 2,
                condition: {
                    text: currentDay.Day.IconPhrase
                },
                humidity: currentDay.RelativeHumidity || 65,
                wind_kph: currentDay.Wind.Speed.Value || 10,
                wind_dir: currentDay.Wind.Direction.English || 'N'
            };
            
            const forecastDays = forecast.DailyForecasts.slice(0, Math.min(data.days_provided || 5, 5));

            // Update UI with Current Weather
            const weatherTemp = document.querySelector('.weather-temp');
            const weatherDesc = document.querySelector('.weather-desc');
            const weatherLocationText = document.getElementById('weatherLocationText');
            
            if (weatherTemp) weatherTemp.textContent = `${Math.round(current.temp_c)}°`;
            if (weatherDesc) weatherDesc.textContent = current.condition.text;
            if (weatherLocationText) weatherLocationText.textContent = `${location.LocalizedName}, ${location.AdministrativeArea.LocalizedName}`;

            const wdHumidity = document.getElementById('wd-humidity');
            if (wdHumidity) wdHumidity.textContent = `${current.humidity}%`;

            const wdWind = document.getElementById('wd-wind');
            if (wdWind) wdWind.textContent = `${current.wind_kph} km/h ${current.wind_dir}`;

            const wdSunrise = document.getElementById('wd-sunrise');
            if (wdSunrise && forecastDays[0]) wdSunrise.textContent = forecastDays[0].Sun.Rise || 'N/A';

            const wdSunset = document.getElementById('wd-sunset');
            if (wdSunset && forecastDays[0]) wdSunset.textContent = forecastDays[0].Sun.Set || 'N/A';

            const wdRain = document.getElementById('wd-rain');
            if (wdRain && forecastDays[0]) wdRain.textContent = `${forecastDays[0].Day.PrecipitationProbability || 0}%`;

            const wdUv = document.getElementById('wd-uv');
            if (wdUv) wdUv.textContent = currentDay.UVIndex || 'N/A';

            // Populate 7-Day Forecast (or up to available days)
            const weather7DayList = document.querySelector('.weather-7day-list');
            if (weather7DayList && forecastDays.length > 0) {
                let html = '';
                const daysToShow = Math.min(forecastDays.length, 7);
                
                for (let i = 0; i < daysToShow; i++) {
                    const day = forecastDays[i];
                    const dateObj = new Date(day.Date);
                    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    // AccuWeather icon URL format
                    const iconUrl = `https://developer.accuweather.com/sites/default/files/${day.Day.Icon < 10 ? '0' : ''}${day.Day.Icon}-s.png`;
                    
                    // First item is "today" and can be expanded or marked somehow, but for now just rows
                    html += `
                        <div class="w7-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                            <div style="width: 80px; color: var(--text-primary);">${dateStr}</div>
                            <div style="display: flex; align-items: center; gap: 4px; width: 60px;">
                                <img src="${iconUrl}" style="width:24px; height:24px;" onerror="this.style.display='none'"> 
                                <span style="color: #60a5fa; font-size: 11px;">${day.Day.PrecipitationProbability || 0}%</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; width: 70px; justify-content: flex-end;">
                                <span style="font-weight: 700;">${Math.round(day.Temperature.Maximum.Value)}°</span> 
                                <span style="color: var(--text-muted);">${Math.round(day.Temperature.Minimum.Value)}°</span>
                            </div>
                        </div>
                    `;
                }
                weather7DayList.innerHTML = html;
            }

            // Cleanup
            if (weatherSearchBtn) {
                weatherSearchBtn.textContent = 'Search';
                weatherSearchBtn.disabled = false;
            }
            if (weatherSearchInput) {
                weatherSearchInput.value = '';
            }

            this.showNotification(`Weather updated for ${data.location.name}`, 'success');
            this.addActivity('weather_search', `Checked weather for ${data.location.name}`);

        } catch (error) {
            console.warn(error);
            if (weatherSearchBtn) {
                weatherSearchBtn.textContent = 'Search';
                weatherSearchBtn.disabled = false;
            }
            this.showNotification(`Could not find weather for "${city}". Please try another city.`, 'error');
        }
    }

    // Update crop health summary
    updateCropHealthSummary() {
        // BUG 08 Fix: Use a stable ID to find the Crop Health card instead of the
        // invalid CSS :contains() pseudo-selector that throws SyntaxError.
        const cropHealthSection = document.getElementById('cropHealthCard');
        if (!cropHealthSection) return;

        if (this.crops.length === 0) {
            const emptyStateDiv = cropHealthSection.querySelector('div[style*="text-align: center"]');
            if (emptyStateDiv) {
                emptyStateDiv.style.display = 'block';
            }
            return;
        }

        // Hide empty state
        const emptyStateDiv = cropHealthSection.querySelector('div[style*="text-align: center"]');
        if (emptyStateDiv) {
            emptyStateDiv.style.display = 'none';
        }

        // Create crop list
        const cropListHTML = this.crops.map(crop => `
            <div class="crop-item">
                <div class="crop-info">
                    <div class="crop-name">${crop.name}</div>
                    <div class="crop-details">${crop.area} acres • ${crop.location}</div>
                    <div class="crop-status">Status: ${crop.status}</div>
                </div>
                <div class="crop-actions">
                    <button class="btn btn-sm btn-secondary">View Details</button>
                </div>
            </div>
        `).join('');

        // Insert crop list
        const cropListContainer = cropHealthSection.querySelector('.crop-list-container');
        if (!cropListContainer) {
            const container = document.createElement('div');
            container.className = 'crop-list-container';
            container.innerHTML = cropListHTML;
            cropHealthSection.appendChild(container);
        } else {
            cropListContainer.innerHTML = cropListHTML;
        }
    }

    // Add activity to recent activity
    addActivity(type, description) {
        const activity = {
            id: Date.now(),
            type: type,
            description: description,
            timestamp: new Date().toISOString()
        };

        this.activities.unshift(activity);

        // Keep only last 20 activities
        if (this.activities.length > 20) {
            this.activities = this.activities.slice(0, 20);
        }

        this.saveData();
        this.updateRecentActivity();
    }

    // Update recent activity display
    updateRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        if (this.activities.length === 0) {
            activityList.innerHTML = `
                <li class="activity-item">
                    <div class="activity-content">
                        <div class="activity-title">No recent activity</div>
                        <div class="activity-time">Start using the app to see your activities</div>
                    </div>
                </li>
            `;
            return;
        }

        const activitiesHTML = this.activities.slice(0, 5).map(activity => `
            <li class="activity-item">
                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.description}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </li>
        `).join('');

        activityList.innerHTML = activitiesHTML;
    }

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            crop_added: '🌱',
            task_added: '📝',
            weather_search: '🌤️',
            market_viewed: '💰',
            file_uploaded: '📁',
            photo_captured: '📸'
        };

        return icons[type] || '📋';
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Add to notifications list
        const notification = {
            id: Date.now(),
            title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
            message: message,
            type: type,
            read: false,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        this.updateNotificationBadge();

        // Show in-app notification
        if (window.notificationFunctional && typeof window.notificationFunctional.showNotification === 'function') {
            window.notificationFunctional.showNotification(notification);
        } else if (window.toast) {
            if (type === 'success') window.toast.success(message);
            else if (type === 'error') window.toast.error(message);
            else window.toast.info(message);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Update UI components
    updateUI() {
        this.updateCropHealthSummary();
        this.updateRecentActivity();
        this.updateNotificationBadge();
    }
}

// Initialize dashboard functionality
window.dashboardFunctional = new DashboardFunctional();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardFunctional.init();
});
