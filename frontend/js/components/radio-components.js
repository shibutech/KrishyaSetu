/*
===========================================
KRISHYASETU RADIO GROUP COMPONENTS
===========================================
JavaScript components for radio button groups and single selection
===========================================
*/

// ========================================
// RADIO GROUP CLASS
// ========================================

class RadioGroup {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            name: options.name || `radio-group-${Date.now()}`,
            value: options.value || null,
            required: options.required || false,
            disabled: options.disabled || false,
            orientation: options.orientation || 'vertical', // vertical, horizontal, inline
            variant: options.variant || 'default', // default, card, button, segment
            size: options.size || 'medium', // sm, md, lg
            color: options.color || 'primary', // primary, success, warning, error
            showIcons: options.showIcons || false,
            showImages: options.showImages || false,
            onChange: options.onChange || (() => {}),
            onValidate: options.onValidate || (() => {}),
            ...options
        };
        
        this.value = this.options.value;
        this.isValid = true;
        this.errorMessage = '';
        
        this.init();
    }

    init() {
        this.createRadioGroup();
        this.bindEvents();
        this.updateSelectedValue();
    }

    createRadioGroup() {
        const groupHTML = `
            <div class="radio-group ${this.getGroupClasses()}" id="radio-group-${Date.now()}">
                ${this.options.options.map((option, index) => this.createRadioOption(option, index)).join('')}
                ${this.options.required ? `<div class="radio-error" id="radio-error" style="display: none;">
                    <div class="radio-error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="radio-error-message">Please select an option</div>
                </div>` : ''}
                ${this.options.help ? `<div class="radio-help">${this.options.help}</div>` : ''}
            </div>
        `;

        this.container.innerHTML = groupHTML;
        this.groupElement = this.container.querySelector('.radio-group');
        this.errorElement = this.container.querySelector('.radio-error');
    }

    createRadioOption(option, index) {
        const optionId = `${this.options.name}-${index}`;
        const isChecked = this.value === option.value;
        
        return `
            <div class="radio-item ${isChecked ? 'selected' : ''}">
                <input type="radio" 
                       class="radio-input" 
                       id="${optionId}" 
                       name="${this.options.name}" 
                       value="${option.value}" 
                       ${isChecked ? 'checked' : ''} 
                       ${this.options.disabled ? 'disabled' : ''}>
                
                <div class="radio-button"></div>
                
                <div class="radio-content">
                    ${this.options.showIcons && option.icon ? `<div class="radio-icon">
                            <i class="${option.icon}"></i>
                        </div>` : ''}
                    
                    ${this.options.showImages && option.image ? `<div class="radio-image">
                            <img src="${option.image}" alt="${option.label}">
                        </div>` : ''}
                    
                    <label class="radio-label" for="${optionId}">${option.label}</label>
                    
                    ${option.description ? `<div class="radio-description">${option.description}</div>` : ''}
                </div>
            </div>
        `;
    }

    getGroupClasses() {
        const classes = [];
        
        // Size
        if (this.options.size !== 'medium') {
            classes.push(`radio-group-${this.options.size}`);
        }
        
        // Orientation
        if (this.options.orientation !== 'vertical') {
            classes.push(this.options.orientation);
        }
        
        // Variant
        if (this.options.variant !== 'default') {
            classes.push(this.options.variant);
        }
        
        // Color
        if (this.options.color !== 'primary') {
            classes.push(this.options.color);
        }
        
        // Features
        if (this.options.showIcons) {
            classes.push('radio-with-icon');
        }
        
        if (this.options.showImages) {
            classes.push('radio-with-image');
        }
        
        // States
        if (this.options.required) {
            classes.push('required');
        }
        
        if (!this.isValid) {
            classes.push('has-error');
        }
        
        return classes.join(' ');
    }

    bindEvents() {
        // Radio input change events
        const radioInputs = this.groupElement.querySelectorAll('.radio-input');
        
        radioInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleRadioChange(e);
            });
            
            // Keyboard navigation
            input.addEventListener('keydown', (e) => {
                this.handleKeydown(e, input);
            });
        });

        // Click events for better accessibility
        const radioItems = this.groupElement.querySelectorAll('.radio-item');
        
        radioItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const input = item.querySelector('.radio-input');
                if (input && !input.disabled) {
                    input.checked = true;
                    this.handleRadioChange({ target: input });
                }
            });
        });
    }

    handleRadioChange(e) {
        const input = e.target;
        const value = input.value;
        const option = this.options.options.find(opt => opt.value === value);
        
        // Update value
        this.value = value;
        
        // Update UI
        this.updateSelectedValue();
        
        // Clear error if present
        if (this.isValid === false) {
            this.clearError();
        }
        
        // Callback
        this.options.onChange(value, option, e);
    }

    handleKeydown(e, input) {
        const radioInputs = Array.from(this.groupElement.querySelectorAll('.radio-input'));
        const currentIndex = radioInputs.indexOf(input);
        
        let nextIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : radioInputs.length - 1;
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                nextIndex = currentIndex < radioInputs.length - 1 ? currentIndex + 1 : 0;
                break;
            case ' ':
                e.preventDefault();
                input.checked = true;
                this.handleRadioChange({ target: input });
                return;
        }
        
        if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < radioInputs.length) {
            radioInputs[nextIndex].focus();
            radioInputs[nextIndex].checked = true;
            this.handleRadioChange({ target: radioInputs[nextIndex] });
        }
    }

    updateSelectedValue() {
        const radioInputs = this.groupElement.querySelectorAll('.radio-input');
        const radioItems = this.groupElement.querySelectorAll('.radio-item');
        
        radioInputs.forEach((input, index) => {
            const item = radioItems[index];
            const isChecked = input.value === this.value;
            
            // Update input checked state
            input.checked = isChecked;
            
            // Update item selected state
            item.classList.toggle('selected', isChecked);
        });
    }

    // Validation methods
    validate() {
        if (this.options.required && !this.value) {
            this.showError('Please select an option');
            return false;
        }
        
        this.clearError();
        return true;
    }

    showError(message) {
        this.isValid = false;
        this.errorMessage = message;
        
        if (this.errorElement) {
            this.errorElement.querySelector('.radio-error-message').textContent = message;
            this.errorElement.style.display = 'flex';
        }
        
        this.groupElement.classList.add('has-error');
        this.options.onValidate(false, message);
    }

    clearError() {
        this.isValid = true;
        this.errorMessage = '';
        
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
        
        this.groupElement.classList.remove('has-error');
        this.options.onValidate(true);
    }

    // Public methods
    setValue(value) {
        this.value = value;
        this.updateSelectedValue();
        this.clearError();
    }

    getValue() {
        return this.value;
    }

    getSelectedOption() {
        return this.options.options.find(opt => opt.value === this.value);
    }

    setDisabled(disabled) {
        this.options.disabled = disabled;
        const radioInputs = this.groupElement.querySelectorAll('.radio-input');
        const radioItems = this.groupElement.querySelectorAll('.radio-item');
        
        radioInputs.forEach(input => {
            input.disabled = disabled;
        });
        
        radioItems.forEach(item => {
            item.classList.toggle('disabled', disabled);
        });
    }

    addOption(option) {
        this.options.options.push(option);
        this.createRadioGroup();
        this.bindEvents();
        this.updateSelectedValue();
    }

    removeOption(value) {
        this.options.options = this.options.options.filter(opt => opt.value !== value);
        this.createRadioGroup();
        this.bindEvents();
        this.updateSelectedValue();
    }

    updateOptions(options) {
        this.options.options = options;
        this.createRadioGroup();
        this.bindEvents();
        this.updateSelectedValue();
    }

    // Static method for initialization
    static init(container, options) {
        return new RadioGroup(container, options);
    }
}

// ========================================
// SEGMENT CONTROL CLASS
// ========================================

class SegmentControl extends RadioGroup {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            variant: 'segment',
            orientation: 'horizontal'
        });
    }
}

// ========================================
// RADIO BUTTON GROUP CLASS
// ========================================

class RadioButtonGroup extends RadioGroup {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            variant: 'button',
            orientation: 'horizontal'
        });
    }
}

// ========================================
// RADIO CARD GROUP CLASS
// ========================================

class RadioCardGroup extends RadioGroup {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            variant: 'card'
        });
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize radio components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize radio groups
    document.querySelectorAll('[data-radio-group]').forEach(element => {
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
            name: element.dataset.name || `radio-group-${Date.now()}`,
            value: element.dataset.value || null,
            required: element.dataset.required === 'true',
            disabled: element.dataset.disabled === 'true',
            orientation: element.dataset.orientation || 'vertical',
            variant: element.dataset.variant || 'default',
            size: element.dataset.size || 'medium',
            color: element.dataset.color || 'primary',
            showIcons: element.dataset.showIcons === 'true',
            showImages: element.dataset.showImages === 'true',
            help: element.dataset.help || '',
            options: options
        };

        new RadioGroup(element, config);
    });

    // Auto-initialize segment controls
    document.querySelectorAll('[data-segment-control]').forEach(element => {
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
            name: element.dataset.name || `segment-${Date.now()}`,
            value: element.dataset.value || null,
            options: options
        };

        new SegmentControl(element, config);
    });

    // Auto-initialize radio button groups
    document.querySelectorAll('[data-radio-button-group]').forEach(element => {
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
            name: element.dataset.name || `radio-btn-group-${Date.now()}`,
            value: element.dataset.value || null,
            options: options
        };

        new RadioButtonGroup(element, config);
    });

    // Auto-initialize radio card groups
    document.querySelectorAll('[data-radio-card-group]').forEach(element => {
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
            name: element.dataset.name || `radio-card-group-${Date.now()}`,
            value: element.dataset.value || null,
            options: options
        };

        new RadioCardGroup(element, config);
    });
});

// Export for use in other modules
window.KrishyaSetu.RadioGroup = RadioGroup;
window.KrishyaSetu.SegmentControl = SegmentControl;
window.KrishyaSetu.RadioButtonGroup = RadioButtonGroup;
window.KrishyaSetu.RadioCardGroup = RadioCardGroup;
