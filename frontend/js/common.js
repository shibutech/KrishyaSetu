// Common functions for KrishyaSetu

// Load navbar into page
function loadNavbar() {
    // Check if we should show navbar (not on signup/permission/language/login pages)
    const currentPath = window.location.pathname.split('/').pop();
    const noNavbarPages = ['signup.html', 'permissions.html', 'language.html', 'login.html'];

    if (noNavbarPages.includes(currentPath)) {
        return; // Don't load navbar on these pages
    }

    // Check user login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userMode = localStorage.getItem('userMode');
    const userType = localStorage.getItem('userType');
    const isGuest = userMode === 'guest' || userType === 'guest' || !isLoggedIn;

    let userName = isLoggedIn ? 'Farmer' : 'Guest';
    let userAvatarInitials = isLoggedIn ? '👨‍🌾' : '👤';
    let avatarImgHtml = '';

    if (isLoggedIn) {
        try {
            const personalInfoStr = localStorage.getItem('personalInfo');
            if (personalInfoStr) {
                const personalInfo = JSON.parse(personalInfoStr);
                if (personalInfo.firstName || personalInfo.lastName) {
                    userName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
                    const firstInitial = personalInfo.firstName ? personalInfo.firstName.charAt(0).toUpperCase() : '';
                    const lastInitial = personalInfo.lastName ? personalInfo.lastName.charAt(0).toUpperCase() : '';
                    if (firstInitial || lastInitial) {
                        userAvatarInitials = firstInitial + lastInitial;
                    }
                }
            }
        } catch (e) { }

        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            avatarImgHtml = `<img src="${savedAvatar}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }

    console.log('Navbar loading:', { isLoggedIn, userMode, userType, isGuest, currentPath });

    // Create navbar HTML based on login status
    const navbarHTML = `
    <nav class="navbar">
        <div class="navbar-container">
            <div class="navbar-brand">
                <div class="navbar-logo" style="background: transparent;">
                    <img src="pwa/icons/krishyasetu.png" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">
                </div>
                <span style="color: var(--accent);">KrishiSetu</span>
            </div>

            <button class="hamburger" id="hamburger" style="display:none; background:none; border:none; font-size:24px; color:var(--text-secondary); cursor:pointer; padding:8px; position: absolute; top: 12px; right: 16px; z-index: 1000;">
                <i class="fas fa-bars"></i>
            </button>
            
            <div class="navbar-divider"></div>
            
            <ul class="navbar-links">
                <li><a href="dashboard.html" class="navbar-link">Dashboard</a></li>
                <li><a href="chatbot.html" class="navbar-link">ChatBot</a></li>
                <li><a href="arscan.html" class="navbar-link">AR Scan</a></li>
                <li>
                    <a href="soil.html" class="navbar-link">
                        Soil Analysis
                    </a>
                </li>
                <li><a href="pest.html" class="navbar-link">Pest Detection</a></li>
                <li><a href="calendar.html" class="navbar-link">Farming Calendar</a></li>
                <li><a href="market.html" class="navbar-link">Market Prices</a></li>
                <li><a href="reports.html" class="navbar-link">Reports</a></li>
                ${isGuest ?
            '<li><a href="login.html" class="navbar-link">Login</a></li>' :
            '<li><a href="profile.html" class="navbar-link profile-link">Profile</a></li>'
        }
            </ul>
            
            <div class="navbar-right">
                <button class="navbar-icon-btn" id="notificationBellBtn" title="Notifications" style="position:relative; background:transparent; border:none; cursor:pointer; font-size:20px; color:var(--text-secondary); padding:4px; display:flex; align-items:center; justify-content:center;">
                    <i class="fas fa-bell"></i>
                    <span id="navbarNotificationBadge" style="display:none; position:absolute; top:2px; right:2px; width:10px; height:10px; background:#ef4444; border-radius:50%; border:2px solid var(--navbar-bg);"></span>
                </button>

                <button class="theme-toggle" id="themeToggle" style="background:transparent; border:none; font-size:18px; color:var(--text-secondary); cursor:pointer; margin: 0 12px;">
                    <i class="far fa-moon" id="themeIcon"></i>
                </button>
                
                <select class="lang-selector" id="langSelector">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="bn">Bengali</option>
                    <option value="pa">Punjabi</option>
                    <option value="ch">Chhattisgarhi</option>
                </select>
                
                ${!isGuest ? `
                <div class="user-profile" style="margin-left: 12px;">
                    <div class="user-avatar" id="navbarAvatar" style="overflow: hidden; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: ${avatarImgHtml ? 'inherit' : '16px'}; font-weight: bold; width: 32px; height: 32px; border-radius: 50%;">
                        ${avatarImgHtml ? avatarImgHtml : userAvatarInitials}
                    </div>
                </div>` : ''}
            </div>
        </div>
    </nav>`;

    // Insert navbar at the beginning of body
    const body = document.body;
    body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Ensure mobile sidebar and overlay exist (for cases where they aren't in the partial/HTML)
    if (!document.getElementById('mobileSidebar')) {
        const sidebarHTML = `
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
            <div class="mobile-sidebar" id="mobileSidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo" style="background: transparent;">
                        <img src="pwa/icons/krishyasetu.png" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">
                    </div>
                    <span>KrishiSetu</span>
                </div>
                <ul class="sidebar-links">
                    <li><a href="dashboard.html"><i class="fas fa-th-large"></i> Dashboard</a></li>
                    <li><a href="chatbot.html"><i class="fas fa-comment-dots"></i> ChatBot</a></li>
                    <li><a href="arscan.html"><i class="fas fa-camera"></i> AR Scan</a></li>
                    <li><a href="soil.html"><i class="fas fa-seedling"></i> Soil Analysis</a></li>
                    <li><a href="pest.html"><i class="fas fa-bug"></i> Pest Detection</a></li>
                    <li><a href="calendar.html"><i class="fas fa-calendar-alt"></i> Farming Calendar</a></li>
                    <li><a href="market.html"><i class="fas fa-chart-line"></i> Market Prices</a></li>
                    <li><a href="reports.html"><i class="fas fa-file-alt"></i> Reports</a></li>
                    ${isGuest ? '<li><a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a></li>' : '<li><a href="profile.html"><i class="fas fa-user"></i> Profile</a></li>'}
                </ul>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', sidebarHTML);
    }

    // Initialize navbar functionality
    initNavbar();
}

// Initialize navbar functionality
function initNavbar() {
    // Add language selector styles
    const style = document.createElement('style');
    style.textContent = `
        .lang-selector {
            background: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 6px 12px;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-right: 12px;
        }
        .lang-selector:hover {
            border-color: var(--accent);
            background: var(--accent-light-bg);
        }
        .lang-selector:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
        @media (max-width: 992px) {
            .navbar-links {
                display: none !important;
            }
            .hamburger {
                display: block !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Set active navigation link
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Language selector
    const langSelector = document.getElementById('langSelector');
    if (langSelector) {
        // Load saved language.
        let savedLang = localStorage.getItem('selectedLanguage') || 'en';

        langSelector.value = savedLang;

        // Handle language change
        langSelector.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            localStorage.setItem('selectedLanguage', selectedLang);

            // Update profile page language selector if it exists
            const profileLangSelector = document.getElementById('language');
            if (profileLangSelector) {
                profileLangSelector.value = selectedLang;
            }

            // Removed Google Translate integration
        });
    }

    // Notification Bell
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    if (notificationBellBtn) {
        notificationBellBtn.addEventListener('click', () => {
            if (window.notificationFunctional && typeof window.notificationFunctional.showNotificationCenter === 'function') {
                window.notificationFunctional.showNotificationCenter();
            } else {
                console.warn('notificationFunctional.showNotificationCenter not found');
                // Fallback if the functional script isn't loaded
                toast.info('Notifications feature is initializing...');
            }
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;
    const bodyEl = document.body; // Target body too to be safe

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    bodyEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            html.setAttribute('data-theme', newTheme);
            bodyEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);

            // Dispatch theme change event for other components to listen to
            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: newTheme }
            }));
            
            console.log('Theme changed to:', newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (themeIcon) {
            // Dark mode → show sun (click to go light), Light mode → show moon (click to go dark)
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Hamburger menu (mobile sidebar toggle)
    const hamburger = document.getElementById('hamburger');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (hamburger && mobileSidebar && sidebarOverlay) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileSidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Listen for profile updates from other pages
    window.addEventListener('profileUpdated', (e) => {
        const data = e.detail;
        const newName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        
        // Update navbar user name
        const navbarUserName = document.getElementById('navbarUserName');
        if (navbarUserName) {
            navbarUserName.textContent = newName;
        }
        
        // Update welcome message
        const welcomeTitle = document.querySelector('.welcome-title');
        if (welcomeTitle && newName) {
            welcomeTitle.textContent = `Welcome, ${newName}! 👋`;
        }
        
        // Update avatar initials if no image
        const navbarAvatar = document.getElementById('navbarAvatar');
        if (navbarAvatar && !navbarAvatar.querySelector('img')) {
            const firstInitial = data.firstName ? data.firstName.charAt(0).toUpperCase() : '';
            const lastInitial = data.lastName ? data.lastName.charAt(0).toUpperCase() : '';
            navbarAvatar.textContent = firstInitial + lastInitial;
        }
        
        console.log('Navbar and welcome updated with new profile:', newName);
    });

    // Listen for avatar updates from other pages
    window.addEventListener('avatarUpdated', (e) => {
        const { avatar } = e.detail;
        
        // Update navbar avatar
        const navbarAvatar = document.getElementById('navbarAvatar');
        if (navbarAvatar) {
            navbarAvatar.innerHTML = `<img src="${avatar}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        
        console.log('Navbar avatar updated');
    });

    // Listen for app settings updates
    window.addEventListener('appSettingsUpdated', (e) => {
        const data = e.detail;
        
        // Update language selector
        const langSelector = document.getElementById('langSelector');
        if (langSelector && data.language) {
            langSelector.value = data.language;
        }
        
        console.log('App settings applied to navbar');
    });

    // Check for pending profile updates on page load
    const pendingUpdate = sessionStorage.getItem('pendingProfileUpdate');
    if (pendingUpdate) {
        try {
            const data = JSON.parse(pendingUpdate);
            const newName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            
            const navbarUserName = document.getElementById('navbarUserName');
            if (navbarUserName && newName) {
                navbarUserName.textContent = newName;
            }
            
            // Also update welcome message if exists
            const welcomeTitle = document.querySelector('.welcome-title');
            if (welcomeTitle) {
                welcomeTitle.textContent = `Welcome, ${newName}! 👋`;
            }
            
            // Clear pending update
            sessionStorage.removeItem('pendingProfileUpdate');
        } catch (e) {
            console.warn('Error applying pending profile update:', e);
        }
    }

    // Update welcome message with user's name on page load
    function updateWelcomeMessage() {
        const savedPersonalInfo = localStorage.getItem('personalInfo');
        if (savedPersonalInfo) {
            try {
                const data = JSON.parse(savedPersonalInfo);
                const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                if (name) {
                    const welcomeTitle = document.querySelector('.welcome-title');
                    if (welcomeTitle && welcomeTitle.textContent.includes('Farmer')) {
                        welcomeTitle.textContent = `Welcome, ${name}! 👋`;
                    }
                }
            } catch (e) {
                console.warn('Error updating welcome message:', e);
            }
        }
    }
    
    // Delay welcome message update to ensure DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(updateWelcomeMessage, 100));
    } else {
        setTimeout(updateWelcomeMessage, 100);
    }

    // Listen for localStorage changes from other tabs/pages
    window.addEventListener('storage', (e) => {
        if (e.key === 'personalInfo' && e.newValue) {
            try {
                const data = JSON.parse(e.newValue);
                const newName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                
                const navbarUserName = document.getElementById('navbarUserName');
                if (navbarUserName && newName) {
                    navbarUserName.textContent = newName;
                }
                
                // Update welcome message
                const welcomeTitle = document.querySelector('.welcome-title');
                if (welcomeTitle && newName) {
                    welcomeTitle.textContent = `Welcome, ${newName}! 👋`;
                }
                
                // Update avatar initials
                const navbarAvatar = document.getElementById('navbarAvatar');
                if (navbarAvatar && !navbarAvatar.querySelector('img')) {
                    const firstInitial = data.firstName ? data.firstName.charAt(0).toUpperCase() : '';
                    const lastInitial = data.lastName ? data.lastName.charAt(0).toUpperCase() : '';
                    navbarAvatar.textContent = firstInitial + lastInitial;
                }
            } catch (err) {
                console.warn('Error handling storage event:', err);
            }
        }
        
        if (e.key === 'userAvatar' && e.newValue) {
            const navbarAvatar = document.getElementById('navbarAvatar');
            if (navbarAvatar) {
                navbarAvatar.innerHTML = `<img src="${e.newValue}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        }
    });
}

// Load navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    // DOM already loaded, load navbar now
    loadNavbar();
}

// Function to refresh navbar (call this after login/logout)
function refreshNavbar() {
    // Remove existing navbar
    const existingNavbar = document.querySelector('.navbar');
    if (existingNavbar) {
        existingNavbar.remove();
    }
    // Load new navbar with updated status
    loadNavbar();
}

// Make refreshNavbar available globally
window.refreshNavbar = refreshNavbar;

// Logout function
function logout() {
    // Clear login state
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('userMode', 'guest');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('rememberLogin');

    // Refresh navbar
    refreshNavbar();

    // Redirect to login page
    window.location.href = 'login.html';
}

// Make logout available globally
window.logout = logout;

// Toast Notification System
const toast = {
    show: function(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container') || this.createContainer();
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 
                     type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        toastEl.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toastEl);
        
        // Trigger reflow for animation
        toastEl.offsetHeight;
        toastEl.classList.add('show');
        
        setTimeout(() => {
            toastEl.classList.remove('show');
            setTimeout(() => {
                toastEl.remove();
                if (toastContainer.childNodes.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, duration);
    },
    
    createContainer: function() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    },
    
    info: function(msg, dur) { this.show(msg, 'info', dur); },
    success: function(msg, dur) { this.show(msg, 'success', dur); },
    error: function(msg, dur) { this.show(msg, 'error', dur); },
    warning: function(msg, dur) { this.show(msg, 'warning', dur); }
};

window.toast = toast;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Note: scope defaults to the SW file's directory (/pwa/).
        // A Service-Worker-Allowed header on the server is needed to extend scope to '/'.
        // Without that header, specifying scope:'/' causes a SecurityError.
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}



