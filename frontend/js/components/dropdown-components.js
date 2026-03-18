/*
===========================================
KRISHYASETU DROPDOWN COMPONENTS
===========================================
JavaScript components for dropdown menus, selects, and multi-selects
===========================================
*/

// ========================================
// DROPDOWN CLASS
// ========================================

class Dropdown {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            placeholder: options.placeholder || 'Select an option',
            multiple: options.multiple || false,
            searchable: options.searchable !== false,
            clearable: options.clearable !== false,
            disabled: options.disabled || false,
            required: options.required || false,
            value: options.value || (options.multiple ? [] : null),
            options: options.options || [],
            maxItems: options.maxItems || 10,
            showIcons: options.showIcons || false,
            showImages: options.showImages || false,
            position: options.position || 'bottom', // bottom, top, auto
            onChange: options.onChange || (() => {}),
            onSearch: options.onSearch || (() => {}),
            onOpen: options.onOpen || (() => {}),
            onClose: options.onClose || (() => {}),
            ...options
        };
        
        this.value = this.options.value;
        this.isOpen = false;
        this.searchTerm = '';
        this.filteredOptions = [...this.options.options];
        
        this.init();
    }

    init() {
        this.createDropdown();
        this.bindEvents();
        this.updateSelectedDisplay();
    }

    createDropdown() {
        const dropdownHTML = `
            <div class="dropdown ${this.getDropdownClasses()}" id="dropdown-${Date.now()}">
                <div class="dropdown-trigger ${this.value === null || (Array.isArray(this.value) && this.value.length === 0) ? 'placeholder' : ''}" id="dropdown-trigger">
                    <div class="dropdown-trigger-content">
                        ${this.options.multiple ? this.renderMultiSelectTrigger() : this.renderSingleSelectTrigger()}
                    </div>
                    <div class="dropdown-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="dropdown-menu" id="dropdown-menu">
                    ${this.options.searchable ? `
                        <div class="dropdown-search">
                            <input type="text" class="dropdown-search-input" placeholder="Search options..." id="dropdown-search">
                        </div>
                    ` : ''}
                    
                    <div class="dropdown-options" id="dropdown-options">
                        ${this.renderOptions()}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = dropdownHTML;
        this.dropdownElement = this.container.querySelector('.dropdown');
        this.triggerElement = this.container.querySelector('.dropdown-trigger');
        this.menuElement = this.container.querySelector('.dropdown-menu');
        this.optionsElement = this.container.querySelector('.dropdown-options');
        this.searchElement = this.container.querySelector('.dropdown-search-input');
    }

    renderSingleSelectTrigger() {
        if (this.value === null) {
            return `<span class="dropdown-placeholder">${this.options.placeholder}</span>`;
        }
        
        const selectedOption = this.options.options.find(opt => opt.value === this.value);
        if (!selectedOption) {
            return `<span class="dropdown-placeholder">${this.options.placeholder}</span>`;
        }
        
        return `
            ${this.options.showIcons && selectedOption.icon ? `<i class="${selectedOption.icon}" style="margin-right: 8px;"></i>` : ''}
            ${this.options.showImages && selectedOption.image ? `<img src="${selectedOption.image}" alt="${selectedOption.label}" style="width: 20px; height: 20px; margin-right: 8px; border-radius: 4px; object-fit: cover;">` : ''}
            <span>${selectedOption.label}</span>
        `;
    }

    renderMultiSelectTrigger() {
        if (!Array.isArray(this.value) || this.value.length === 0) {
            return `<span class="dropdown-placeholder">${this.options.placeholder}</span>`;
        }
        
        const selectedItems = this.value.map(val => {
            const option = this.options.options.find(opt => opt.value === val);
            return option ? `
                <span class="dropdown-selected-item">
                    ${option.label}
                    <span class="dropdown-selected-item-remove" data-value="${val}">×</span>
                </span>
            ` : '';
        }).join('');
        
        return `<div class="dropdown-selected-items">${selectedItems}</div>`;
    }

    renderOptions() {
        if (this.filteredOptions.length === 0) {
            return '<div class="dropdown-option no-results">No options found</div>';
        }
        
        return this.filteredOptions.map(option => {
            const isSelected = this.options.multiple ? 
                (Array.isArray(this.value) && this.value.includes(option.value)) :
                (this.value === option.value);
            
            return `
                <div class="dropdown-option ${isSelected ? 'selected' : ''}" data-value="${option.value}">
                    ${this.options.multiple ? '<div class="dropdown-checkbox"></div>' : ''}
                    ${this.options.showIcons && option.icon ? `<div class="dropdown-option-icon"><i class="${option.icon}"></i></div>` : ''}
                    ${this.options.showImages && option.image ? `<div class="dropdown-option-image"><img src="${option.image}" alt="${option.label}"></div>` : ''}
                    <div class="dropdown-option-content">
                        <div class="dropdown-option-label">${option.label}</div>
                        ${option.description ? `<div class="dropdown-option-description">${option.description}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getDropdownClasses() {
        const classes = [];
        
        if (this.options.multiple) classes.push('dropdown-multi');
        if (this.options.showIcons) classes.push('dropdown-with-icons');
        if (this.options.showImages) classes.push('dropdown-with-images');
        if (this.options.disabled) classes.push('disabled');
        if (this.options.position !== 'bottom') classes.push(`dropdown-${this.options.position}`);
        
        return classes.join(' ');
    }

    bindEvents() {
        // Trigger click
        this.triggerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Search input
        if (this.searchElement) {
            this.searchElement.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterOptions();
                this.options.onSearch(this.searchTerm);
            });

            this.searchElement.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });
        }

        // Option clicks
        this.optionsElement.addEventListener('click', (e) => {
            const optionElement = e.target.closest('.dropdown-option');
            if (optionElement && !optionElement.classList.contains('disabled')) {
                const value = optionElement.dataset.value;
                this.selectOption(value);
            }
        });

        // Multi-select remove buttons
        if (this.options.multiple) {
            this.triggerElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropdown-selected-item-remove')) {
                    e.stopPropagation();
                    const value = e.target.dataset.value;
                    this.removeOption(value);
                }
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.dropdownElement.contains(e.target)) {
                this.close();
            }
        });

        // Keyboard navigation
        this.triggerElement.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Position menu
        this.updateMenuPosition();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.options.disabled) return;
        
        this.isOpen = true;
        this.triggerElement.classList.add('active');
        this.menuElement.classList.add('active');
        
        // Focus search input if available
        if (this.searchElement) {
            this.searchElement.focus();
        }
        
        this.updateMenuPosition();
        this.options.onOpen();
    }

    close() {
        this.isOpen = false;
        this.triggerElement.classList.remove('active');
        this.menuElement.classList.remove('active');
        this.options.onClose();
    }

    selectOption(value) {
        const option = this.options.options.find(opt => opt.value === value);
        if (!option) return;

        if (this.options.multiple) {
            // Multi-select logic
            if (!Array.isArray(this.value)) {
                this.value = [];
            }
            
            const index = this.value.indexOf(value);
            if (index > -1) {
                this.value.splice(index, 1);
            } else {
                this.value.push(value);
            }
        } else {
            // Single-select logic
            this.value = value;
            this.close();
        }

        this.updateSelectedDisplay();
        this.updateOptionsDisplay();
        this.options.onChange(this.value, option);
    }

    removeOption(value) {
        if (!Array.isArray(this.value)) return;
        
        const index = this.value.indexOf(value);
        if (index > -1) {
            this.value.splice(index, 1);
            this.updateSelectedDisplay();
            this.updateOptionsDisplay();
            this.options.onChange(this.value);
        }
    }

    filterOptions() {
        if (!this.searchTerm) {
            this.filteredOptions = [...this.options.options];
        } else {
            this.filteredOptions = this.options.options.filter(option => {
                const searchStr = this.searchTerm.toLowerCase();
                return option.label.toLowerCase().includes(searchStr) ||
                       (option.description && option.description.toLowerCase().includes(searchStr));
            });
        }
        
        this.updateOptionsDisplay();
    }

    updateSelectedDisplay() {
        const triggerContent = this.triggerElement.querySelector('.dropdown-trigger-content');
        
        if (this.options.multiple) {
            triggerContent.innerHTML = this.renderMultiSelectTrigger();
        } else {
            triggerContent.innerHTML = this.renderSingleSelectTrigger();
        }
        
        // Update placeholder state
        const hasValue = this.options.multiple ? 
            (Array.isArray(this.value) && this.value.length > 0) :
            (this.value !== null);
        
        this.triggerElement.classList.toggle('placeholder', !hasValue);
    }

    updateOptionsDisplay() {
        this.optionsElement.innerHTML = this.renderOptions();
    }

    updateMenuPosition() {
        if (!this.isOpen) return;

        const rect = this.triggerElement.getBoundingClientRect();
        const menuHeight = this.menuElement.offsetHeight;
        const viewportHeight = window.innerHeight;
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;

        // Determine best position
        let position = this.options.position;
        if (position === 'auto') {
            position = spaceBelow >= menuHeight || spaceBelow > spaceAbove ? 'bottom' : 'top';
        }

        // Apply position
        if (position === 'top') {
            this.menuElement.style.top = 'auto';
            this.menuElement.style.bottom = '100%';
            this.menuElement.style.marginBottom = '4px';
            this.menuElement.style.marginTop = '0';
        } else {
            this.menuElement.style.top = '100%';
            this.menuElement.style.bottom = 'auto';
            this.menuElement.style.marginTop = '4px';
            this.menuElement.style.marginBottom = '0';
        }
    }

    handleKeydown(e) {
        if (this.isOpen) {
            this.handleMenuKeydown(e);
        } else {
            this.handleTriggerKeydown(e);
        }
    }

    handleTriggerKeydown(e) {
        switch (e.key) {
            case 'Enter':
            case ' ':
            case 'ArrowDown':
                e.preventDefault();
                this.open();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.open();
                this.focusLastOption();
                break;
            case 'Escape':
                this.close();
                break;
        }
    }

    handleMenuKeydown(e) {
        const options = Array.from(this.optionsElement.querySelectorAll('.dropdown-option:not(.disabled):not(.no-results)'));
        const currentIndex = options.findIndex(opt => opt.classList.contains('selected'));
        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (currentIndex >= 0) {
                    const value = options[currentIndex].dataset.value;
                    this.selectOption(value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                this.triggerElement.focus();
                break;
        }

        if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < options.length) {
            options[nextIndex].focus();
        }
    }

    focusLastOption() {
        const options = Array.from(this.optionsElement.querySelectorAll('.dropdown-option:not(.disabled):not(.no-results)'));
        if (options.length > 0) {
            options[options.length - 1].focus();
        }
    }

    // Public methods
    setValue(value) {
        this.value = value;
        this.updateSelectedDisplay();
        this.updateOptionsDisplay();
    }

    getValue() {
        return this.value;
    }

    addOption(option) {
        this.options.options.push(option);
        this.filterOptions();
    }

    removeOption(value) {
        this.options.options = this.options.options.filter(opt => opt.value !== value);
        this.filterOptions();
    }

    updateOptions(options) {
        this.options.options = options;
        this.filterOptions();
    }

    setDisabled(disabled) {
        this.options.disabled = disabled;
        this.dropdownElement.classList.toggle('disabled', disabled);
    }

    open() {
        this.open();
    }

    close() {
        this.close();
    }

    // Static method for initialization
    static init(container, options) {
        return new Dropdown(container, options);
    }
}

// ========================================
// MULTI SELECT DROPDOWN CLASS
// ========================================

class MultiSelectDropdown extends Dropdown {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            multiple: true
        });
    }
}

// ========================================
// SEARCHABLE DROPDOWN CLASS
// ========================================

class SearchableDropdown extends Dropdown {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            searchable: true
        });
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize dropdown components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize dropdowns
    document.querySelectorAll('[data-dropdown]').forEach(element => {
        const optionsData = element.dataset.options;
        let options = [];
        
        // Parse options from data attribute
        if (optionsData) {
            try {
                options = JSON.parse(optionsData);
            } catch (e) {
                // Fallback to simple format
                options = optionsData.split(',').map(opt => ({
                    value: opt.trim(),
                    label: opt.trim()
                }));
            }
        }
        
        const config = {
            placeholder: element.dataset.placeholder || 'Select an option',
            multiple: element.dataset.multiple === 'true',
            searchable: element.dataset.searchable !== 'false',
            clearable: element.dataset.clearable !== 'false',
            disabled: element.dataset.disabled === 'true',
            required: element.dataset.required === 'true',
            value: element.dataset.value || null,
            options: options,
            showIcons: element.dataset.showIcons === 'true',
            showImages: element.dataset.showImages === 'true',
            position: element.dataset.position || 'bottom'
        };

        new Dropdown(element, config);
    });

    // Auto-initialize multi-select dropdowns
    document.querySelectorAll('[data-multi-select]').forEach(element => {
        const optionsData = element.dataset.options;
        let options = [];
        
        if (optionsData) {
            try {
                options = JSON.parse(optionsData);
            } catch (e) {
                options = optionsData.split(',').map(opt => ({
                    value: opt.trim(),
                    label: opt.trim()
                }));
            }
        }

        const config = {
            placeholder: element.dataset.placeholder || 'Select options',
            value: element.dataset.value ? element.dataset.value.split(',') : [],
            options: options
        };

        new MultiSelectDropdown(element, config);
    });
});

// Export for use in other modules
window.KrishyaSetu.Dropdown = Dropdown;
window.KrishyaSetu.MultiSelectDropdown = MultiSelectDropdown;
window.KrishyaSetu.SearchableDropdown = SearchableDropdown;
