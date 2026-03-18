/*
===========================================
KRISHYASETU COMPONENT LIBRARY
===========================================
JavaScript component library for KrishyaSetu app
===========================================
*/

// ========================================
// UTILITY FUNCTIONS
// ========================================

class ComponentUtils {
    // Debounce function to limit function calls
    static debounce(func, wait) {
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

    // Throttle function to limit function calls
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate unique ID
    static generateId(prefix = 'ks') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Format date
    static formatDate(date, format = 'short') {
        const options = {
            short: { day: 'numeric', month: 'short', year: 'numeric' },
            long: { day: 'numeric', month: 'long', year: 'numeric' },
            time: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };

        return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(date);
    }

    // Format number with commas
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Get CSS variable value
    static getCSSVariable(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }
}

// ========================================
// MODAL COMPONENT
// ========================================

class Modal {
    constructor(options = {}) {
        this.id = options.id || ComponentUtils.generateId('modal');
        this.title = options.title || '';
        this.content = options.content || '';
        this.footer = options.footer || '';
        this.size = options.size || 'medium';
        this.closeOnBackdrop = options.closeOnBackdrop !== false;
        this.onOpen = options.onOpen || (() => {});
        this.onClose = options.onClose || (() => {});
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modalHTML = `
            <div class="modal-overlay" id="${this.id}-overlay">
                <div class="modal modal-${this.size}" id="${this.id}">
                    <div class="modal-header">
                        <h3 class="modal-title">${this.title}</h3>
                        <button class="modal-close" id="${this.id}-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${this.content}
                    </div>
                    ${this.footer ? `
                        <div class="modal-footer">
                            ${this.footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.overlay = document.getElementById(`${this.id}-overlay`);
        this.modal = document.getElementById(`${this.id}`);
        this.closeBtn = document.getElementById(`${this.id}-close`);
    }

    bindEvents() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.close());

        // Backdrop click
        if (this.closeOnBackdrop) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.onOpen();
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.onClose();
    }

    destroy() {
        this.overlay.remove();
    }

    updateContent(content) {
        this.content = content;
        const body = this.modal.querySelector('.modal-body');
        if (body) {
            body.innerHTML = content;
        }
    }
}

// ========================================
// TOAST NOTIFICATION COMPONENT
// ========================================

class Toast {
    constructor() {
        this.container = this.createContainer();
        this.toasts = [];
    }

    createContainer() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createContainer());
            return null;
        }

        const container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        
        // Ensure document.body exists
        if (document.body) {
            document.body.appendChild(container);
        } else {
            // Fallback: wait for body to be available
            setTimeout(() => {
                if (document.body) {
                    document.body.appendChild(container);
                }
            }, 100);
        }
        
        return container;
    }

    show(message, options = {}) {
        const {
            type = 'info',
            duration = 5000,
            action = null,
            persistent = false
        } = options;

        const toast = this.createToast(message, type, action, persistent);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto remove
        if (!persistent) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    createToast(message, type, action, persistent) {
        const toast = document.createElement('div');
        const id = ComponentUtils.generateId('toast');
        
        toast.id = id;
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-left: 4px solid var(--${type});
            border-radius: 8px;
            padding: 12px 16px;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px var(--shadow);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        const icon = this.getToastIcon(type);
        const actionButton = action ? `
            <button class="toast-action" data-toast-id="${id}">
                ${action.text}
            </button>
        ` : '';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
                ${actionButton}
            </div>
            ${!persistent ? `
                <button class="toast-close" data-toast-id="${id}">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #${id} .toast-icon {
                color: var(--${type});
                font-size: 16px;
            }
            #${id} .toast-content {
                flex: 1;
            }
            #${id} .toast-message {
                font-size: 14px;
                color: var(--text-primary);
                line-height: 1.4;
            }
            #${id} .toast-action {
                background: var(--accent);
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                margin-top: 4px;
            }
            #${id} .toast-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                font-size: 12px;
            }
            #${id} .toast-close:hover {
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);

        // Bind events
        this.bindToastEvents(toast, action);

        return toast;
    }

    getToastIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    bindToastEvents(toast, action) {
        const closeBtn = toast.querySelector('.toast-close');
        const actionBtn = toast.querySelector('.toast-action');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.remove(toast));
        }

        if (actionBtn && action) {
            actionBtn.addEventListener('click', () => {
                action.onClick();
                this.remove(toast);
            });
        }
    }

    remove(toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }
}

// ========================================
// LOADING COMPONENT
// ========================================

class Loading {
    static show(container, options = {}) {
        const {
            message = 'Loading...',
            size = 'medium',
            overlay = true
        } = options;

        const loadingId = ComponentUtils.generateId('loading');
        const loadingHTML = `
            <div class="loading-container" id="${loadingId}">
                ${overlay ? '<div class="loading-overlay"></div>' : ''}
                <div class="loading-content">
                    <div class="spinner spinner-${size}"></div>
                    <div class="loading-message">${message}</div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #${loadingId} {
                position: ${overlay ? 'absolute' : 'relative'};
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            #${loadingId} .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(2px);
            }
            #${loadingId} .loading-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                z-index: 1;
            }
            #${loadingId} .loading-message {
                font-size: 14px;
                color: var(--text-primary);
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);

        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', loadingHTML);

        return loadingId;
    }

    static hide(loadingId) {
        const loading = document.getElementById(loadingId);
        if (loading) {
            loading.remove();
        }
    }
}

// ========================================
// FORM VALIDATION COMPONENT
// ========================================

class FormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.rules = options.rules || {};
        this.messages = options.messages || {};
        this.onSubmit = options.onSubmit || (() => {});
        this.onError = options.onError || (() => {});
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validate()) {
                this.onSubmit();
            } else {
                this.onError();
            }
        });

        // Real-time validation
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }

    validate() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const fieldName = field.name;
        const rules = this.rules[fieldName];
        
        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Check each rule
        for (const rule of rules) {
            const result = this.checkRule(field, rule);
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message;
                break;
            }
        }

        // Show/hide error
        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    checkRule(field, rule) {
        const value = field.value.trim();
        const name = field.name;

        switch (rule.type) {
            case 'required':
                return {
                    valid: value !== '',
                    message: this.messages[name]?.required || `${name} is required`
                };

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    valid: !value || emailRegex.test(value),
                    message: this.messages[name]?.email || 'Please enter a valid email address'
                };

            case 'phone':
                const phoneRegex = /^[6-9]\d{9}$/;
                return {
                    valid: !value || phoneRegex.test(value),
                    message: this.messages[name]?.phone || 'Please enter a valid phone number'
                };

            case 'minLength':
                return {
                    valid: !value || value.length >= rule.value,
                    message: this.messages[name]?.minLength || `Minimum ${rule.value} characters required`
                };

            case 'maxLength':
                return {
                    valid: !value || value.length <= rule.value,
                    message: this.messages[name]?.maxLength || `Maximum ${rule.value} characters allowed`
                };

            case 'pattern':
                return {
                    valid: !value || new RegExp(rule.value).test(value),
                    message: this.messages[name]?.pattern || 'Invalid format'
                };

            default:
                return { valid: true };
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error);
            font-size: 12px;
            margin-top: 4px;
        `;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// ========================================
// TAB COMPONENT
// ========================================

class Tabs {
    constructor(container, options = {}) {
        this.container = container;
        this.activeTab = options.activeTab || 0;
        this.onTabChange = options.onTabChange || (() => {});
        
        this.init();
    }

    init() {
        this.setupTabs();
        this.bindEvents();
        this.activateTab(this.activeTab);
    }

    setupTabs() {
        this.tabButtons = this.container.querySelectorAll('[data-tab]');
        this.tabPanels = this.container.querySelectorAll('[data-tab-panel]');
    }

    bindEvents() {
        this.tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => this.activateTab(index));
        });
    }

    activateTab(index) {
        // Deactivate all tabs
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabPanels.forEach(panel => panel.classList.remove('active'));

        // Activate selected tab
        this.tabButtons[index].classList.add('active');
        this.tabPanels[index].classList.add('active');
        
        this.activeTab = index;
        this.onTabChange(index);
    }
}

// ========================================
// COLLAPSIBLE COMPONENT
// ========================================

class Collapsible {
    constructor(element, options = {}) {
        this.element = element;
        this.isOpen = options.open || false;
        this.duration = options.duration || 300;
        this.onOpen = options.onOpen || (() => {});
        this.onClose = options.onClose || (() => {});
        
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
        this.updateState();
    }

    setupElements() {
        this.trigger = this.element.querySelector('[data-collapsible-trigger]');
        this.content = this.element.querySelector('[data-collapsible-content]');
        
        if (this.content) {
            this.content.style.transition = `all ${this.duration}ms ease`;
            this.content.style.overflow = 'hidden';
        }
    }

    bindEvents() {
        if (this.trigger) {
            this.trigger.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.updateState();
    }

    open() {
        this.isOpen = true;
        this.updateState();
    }

    close() {
        this.isOpen = false;
        this.updateState();
    }

    updateState() {
        if (this.content) {
            if (this.isOpen) {
                this.content.style.maxHeight = this.content.scrollHeight + 'px';
                this.element.classList.add('open');
                this.onOpen();
            } else {
                this.content.style.maxHeight = '0';
                this.element.classList.remove('open');
                this.onClose();
            }
        }

        if (this.trigger) {
            this.trigger.setAttribute('aria-expanded', this.isOpen);
        }
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modals
    document.querySelectorAll('[data-modal]').forEach(element => {
        const target = document.querySelector(element.dataset.modal);
        if (target) {
            element.addEventListener('click', () => {
                const modal = new Modal({
                    content: target.innerHTML
                });
                modal.open();
            });
        }
    });

    // Initialize all tabs
    document.querySelectorAll('[data-tabs]').forEach(container => {
        new Tabs(container);
    });

    // Initialize all collapsibles
    document.querySelectorAll('[data-collapsible]').forEach(element => {
        new Collapsible(element);
    });
});

// Export for use in other modules
window.KrishyaSetu = {
    ComponentUtils,
    Modal,
    Toast,
    Loading,
    FormValidator,
    Tabs,
    Collapsible
};

// Create global toast instance
window.toast = new Toast();
