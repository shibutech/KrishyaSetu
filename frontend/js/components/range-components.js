/*
===========================================
KRISHYASETU RANGE SLIDER COMPONENTS
===========================================
JavaScript components for range selection and numeric inputs
===========================================
*/

// ========================================
// RANGE SLIDER CLASS
// ========================================

class RangeSlider {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            min: options.min || 0,
            max: options.max || 100,
            value: options.value || 50,
            step: options.step || 1,
            showValue: options.showValue !== false,
            showLabels: options.showLabels !== false,
            showProgress: options.showProgress !== false,
            color: options.color || 'primary',
            size: options.size || 'medium',
            disabled: options.disabled || false,
            onChange: options.onChange || (() => {}),
            onInput: options.onInput || (() => {}),
            ...options
        };
        
        this.value = this.options.value;
        this.isDragging = false;
        
        this.init();
    }

    init() {
        this.createSlider();
        this.bindEvents();
        this.updateSlider();
    }

    createSlider() {
        const sliderHTML = `
            <div class="range-slider range-slider-${this.options.size} range-slider-${this.options.color} ${this.options.disabled ? 'disabled' : ''}" id="range-slider-${Date.now()}">
                <div class="range-slider-container">
                    ${this.options.showProgress ? '<div class="range-track"></div>' : ''}
                    ${this.options.showProgress ? '<div class="range-progress"></div>' : ''}
                    <input type="range" class="range-input" min="${this.options.min}" max="${this.options.max}" step="${this.options.step}" value="${this.value}" ${this.options.disabled ? 'disabled' : ''}>
                    ${this.options.showValue ? `<div class="range-value">${this.formatValue(this.value)}</div>` : ''}
                </div>
                ${this.options.showLabels ? `
                    <div class="range-labels">
                        <span class="range-label min">${this.formatValue(this.options.min)}</span>
                        <span class="range-label current">${this.formatValue(this.value)}</span>
                        <span class="range-label max">${this.formatValue(this.options.max)}</span>
                    </div>
                ` : ''}
            </div>
        `;

        this.container.innerHTML = sliderHTML;
        this.sliderElement = this.container.querySelector('.range-slider');
        this.inputElement = this.container.querySelector('.range-input');
        this.progressElement = this.container.querySelector('.range-progress');
        this.valueElement = this.container.querySelector('.range-value');
        this.currentLabelElement = this.container.querySelector('.range-label.current');
    }

    bindEvents() {
        // Input events
        this.inputElement.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);
            this.updateSlider();
            this.options.onInput(this.value, e);
        });

        this.inputElement.addEventListener('change', (e) => {
            this.value = parseFloat(e.target.value);
            this.updateSlider();
            this.options.onChange(this.value, e);
        });

        // Mouse events for value tooltip
        if (this.options.showValue) {
            this.inputElement.addEventListener('mouseenter', () => {
                this.updateValuePosition();
            });

            this.inputElement.addEventListener('mousemove', () => {
                this.updateValuePosition();
            });
        }

        // Touch events
        this.inputElement.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.updateValuePosition();
        });

        this.inputElement.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.updateValuePosition();
            }
        });

        this.inputElement.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    updateSlider() {
        const percentage = this.getPercentage();
        
        // Update progress bar
        if (this.progressElement) {
            this.progressElement.style.width = `${percentage}%`;
        }

        // Update value display
        if (this.valueElement) {
            this.valueElement.textContent = this.formatValue(this.value);
        }

        // Update current label
        if (this.currentLabelElement) {
            this.currentLabelElement.textContent = this.formatValue(this.value);
        }

        // Update value position
        this.updateValuePosition();
    }

    updateValuePosition() {
        if (!this.valueElement) return;

        const percentage = this.getPercentage();
        const sliderWidth = this.inputElement.offsetWidth;
        const thumbWidth = 20; // Approximate thumb width
        const position = (percentage / 100) * sliderWidth;
        
        this.valueElement.style.left = `${position}px`;
    }

    getPercentage() {
        return ((this.value - this.options.min) / (this.options.max - this.options.min)) * 100;
    }

    formatValue(value) {
        if (this.options.formatter) {
            return this.options.formatter(value);
        }

        // Auto-format based on step
        if (this.options.step >= 1) {
            return Math.round(value).toString();
        } else if (this.options.step >= 0.1) {
            return value.toFixed(1);
        } else if (this.options.step >= 0.01) {
            return value.toFixed(2);
        } else {
            return value.toFixed(3);
        }
    }

    // Public methods
    setValue(value) {
        value = Math.max(this.options.min, Math.min(this.options.max, value));
        this.value = value;
        this.inputElement.value = value;
        this.updateSlider();
    }

    getValue() {
        return this.value;
    }

    setMin(min) {
        this.options.min = min;
        this.inputElement.min = min;
        if (this.value < min) {
            this.setValue(min);
        }
        this.updateSlider();
    }

    setMax(max) {
        this.options.max = max;
        this.inputElement.max = max;
        if (this.value > max) {
            this.setValue(max);
        }
        this.updateSlider();
    }

    setStep(step) {
        this.options.step = step;
        this.inputElement.step = step;
    }

    setDisabled(disabled) {
        this.options.disabled = disabled;
        this.inputElement.disabled = disabled;
        this.sliderElement.classList.toggle('disabled', disabled);
    }

    setColor(color) {
        this.sliderElement.classList.remove(`range-slider-${this.options.color}`);
        this.options.color = color;
        this.sliderElement.classList.add(`range-slider-${color}`);
    }

    // Static method for initialization
    static init(container, options) {
        return new RangeSlider(container, options);
    }
}

// ========================================
// DUAL RANGE SLIDER CLASS
// ========================================

class DualRangeSlider {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            min: options.min || 0,
            max: options.max || 100,
            values: options.values || [25, 75],
            step: options.step || 1,
            showLabels: options.showLabels !== false,
            showProgress: options.showProgress !== false,
            color: options.color || 'primary',
            onChange: options.onChange || (() => {}),
            ...options
        };
        
        this.values = [...this.options.values];
        this.init();
    }

    init() {
        this.createDualSlider();
        this.bindEvents();
        this.updateDualSlider();
    }

    createDualSlider() {
        const sliderHTML = `
            <div class="dual-range-slider dual-range-slider-${this.options.size || 'medium'} dual-range-slider-${this.options.color}" id="dual-range-${Date.now()}">
                <div class="dual-range-container">
                    <div class="range-track"></div>
                    <div class="dual-range-progress"></div>
                    <input type="range" class="dual-range-input lower" min="${this.options.min}" max="${this.options.max}" step="${this.options.step}" value="${this.values[0]}">
                    <input type="range" class="dual-range-input upper" min="${this.options.min}" max="${this.options.max}" step="${this.options.step}" value="${this.values[1]}">
                </div>
                <div class="dual-range-values">
                    <div class="dual-range-value-group">
                        <div class="dual-range-value-label">From</div>
                        <div class="dual-range-value-display" id="lower-value">${this.formatValue(this.values[0])}</div>
                    </div>
                    <div class="dual-range-value-group">
                        <div class="dual-range-value-label">To</div>
                        <div class="dual-range-value-display" id="upper-value">${this.formatValue(this.values[1])}</div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = sliderHTML;
        this.sliderElement = this.container.querySelector('.dual-range-slider');
        this.lowerInput = this.container.querySelector('.dual-range-input.lower');
        this.upperInput = this.container.querySelector('.dual-range-input.upper');
        this.progressElement = this.container.querySelector('.dual-range-progress');
        this.lowerValueElement = this.container.querySelector('#lower-value');
        this.upperValueElement = this.container.querySelector('#upper-value');
    }

    bindEvents() {
        const handleInput = () => {
            let lowerValue = parseFloat(this.lowerInput.value);
            let upperValue = parseFloat(this.upperInput.value);

            // Ensure lower <= upper
            if (lowerValue > upperValue) {
                if (event.target === this.lowerInput) {
                    lowerValue = upperValue;
                    this.lowerInput.value = lowerValue;
                } else {
                    upperValue = lowerValue;
                    this.upperInput.value = upperValue;
                }
            }

            this.values = [lowerValue, upperValue];
            this.updateDualSlider();
            this.options.onChange(this.values);
        };

        this.lowerInput.addEventListener('input', handleInput);
        this.upperInput.addEventListener('input', handleInput);
        this.lowerInput.addEventListener('change', handleInput);
        this.upperInput.addEventListener('change', handleInput);

        // Enable pointer events for inputs
        this.lowerInput.style.pointerEvents = 'auto';
        this.upperInput.style.pointerEvents = 'auto';
    }

    updateDualSlider() {
        const lowerPercentage = this.getPercentage(this.values[0]);
        const upperPercentage = this.getPercentage(this.values[1]);

        // Update progress bar
        if (this.progressElement) {
            this.progressElement.style.left = `${lowerPercentage}%`;
            this.progressElement.style.width = `${upperPercentage - lowerPercentage}%`;
        }

        // Update value displays
        if (this.lowerValueElement) {
            this.lowerValueElement.textContent = this.formatValue(this.values[0]);
        }
        if (this.upperValueElement) {
            this.upperValueElement.textContent = this.formatValue(this.values[1]);
        }
    }

    getPercentage(value) {
        return ((value - this.options.min) / (this.options.max - this.options.min)) * 100;
    }

    formatValue(value) {
        if (this.options.formatter) {
            return this.options.formatter(value);
        }

        if (this.options.step >= 1) {
            return Math.round(value).toString();
        } else if (this.options.step >= 0.1) {
            return value.toFixed(1);
        } else if (this.options.step >= 0.01) {
            return value.toFixed(2);
        } else {
            return value.toFixed(3);
        }
    }

    // Public methods
    setValues(values) {
        this.values = [...values];
        this.lowerInput.value = this.values[0];
        this.upperInput.value = this.values[1];
        this.updateDualSlider();
    }

    getValues() {
        return [...this.values];
    }
}

// ========================================
// RANGE WITH INPUT CLASS
// ========================================

class RangeWithInput {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            min: options.min || 0,
            max: options.max || 100,
            value: options.value || 50,
            step: options.step || 1,
            inputWidth: options.inputWidth || 80,
            onChange: options.onChange || (() => {}),
            ...options
        };
        
        this.value = this.options.value;
        this.init();
    }

    init() {
        this.createRangeWithInput();
        this.bindEvents();
    }

    createRangeWithInput() {
        const containerHTML = `
            <div class="range-with-input" id="range-with-input-${Date.now()}">
                <div class="range-slider-container">
                    <div class="range-track"></div>
                    <div class="range-progress"></div>
                    <input type="range" class="range-input" min="${this.options.min}" max="${this.options.max}" step="${this.options.step}" value="${this.value}">
                </div>
                <input type="number" class="range-input-field" min="${this.options.min}" max="${this.options.max}" step="${this.options.step}" value="${this.value}" style="width: ${this.options.inputWidth}px">
            </div>
        `;

        this.container.innerHTML = containerHTML;
        this.rangeContainer = this.container.querySelector('.range-slider-container');
        this.rangeInput = this.container.querySelector('.range-input');
        this.numberInput = this.container.querySelector('.range-input-field');
        this.progressElement = this.container.querySelector('.range-progress');
    }

    bindEvents() {
        // Range input events
        this.rangeInput.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);
            this.numberInput.value = this.value;
            this.updateProgress();
            this.options.onChange(this.value);
        });

        // Number input events
        this.numberInput.addEventListener('input', (e) => {
            let value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                value = Math.max(this.options.min, Math.min(this.options.max, value));
                this.value = value;
                this.rangeInput.value = value;
                this.updateProgress();
                this.options.onChange(value);
            }
        });

        this.numberInput.addEventListener('change', (e) => {
            let value = parseFloat(e.target.value);
            if (isNaN(value)) {
                e.target.value = this.value;
            }
        });

        // Initial update
        this.updateProgress();
    }

    updateProgress() {
        const percentage = ((this.value - this.options.min) / (this.options.max - this.options.min)) * 100;
        if (this.progressElement) {
            this.progressElement.style.width = `${percentage}%`;
        }
    }

    // Public methods
    setValue(value) {
        value = Math.max(this.options.min, Math.min(this.options.max, value));
        this.value = value;
        this.rangeInput.value = value;
        this.numberInput.value = value;
        this.updateProgress();
    }

    getValue() {
        return this.value;
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize range components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize range sliders
    document.querySelectorAll('[data-range-slider]').forEach(element => {
        const options = {
            min: parseFloat(element.dataset.min) || 0,
            max: parseFloat(element.dataset.max) || 100,
            value: parseFloat(element.dataset.value) || 50,
            step: parseFloat(element.dataset.step) || 1,
            showValue: element.dataset.showValue !== 'false',
            showLabels: element.dataset.showLabels !== 'false',
            showProgress: element.dataset.showProgress !== 'false',
            color: element.dataset.color || 'primary',
            size: element.dataset.size || 'medium',
            disabled: element.dataset.disabled === 'true'
        };

        new RangeSlider(element, options);
    });

    // Auto-initialize dual range sliders
    document.querySelectorAll('[data-dual-range]').forEach(element => {
        const values = element.dataset.values ? element.dataset.values.split(',').map(v => parseFloat(v.trim())) : [25, 75];
        const options = {
            min: parseFloat(element.dataset.min) || 0,
            max: parseFloat(element.dataset.max) || 100,
            values: values,
            step: parseFloat(element.dataset.step) || 1,
            showLabels: element.dataset.showLabels !== 'false',
            showProgress: element.dataset.showProgress !== 'false',
            color: element.dataset.color || 'primary'
        };

        new DualRangeSlider(element, options);
    });

    // Auto-initialize range with input
    document.querySelectorAll('[data-range-with-input]').forEach(element => {
        const options = {
            min: parseFloat(element.dataset.min) || 0,
            max: parseFloat(element.dataset.max) || 100,
            value: parseFloat(element.dataset.value) || 50,
            step: parseFloat(element.dataset.step) || 1,
            inputWidth: parseInt(element.dataset.inputWidth) || 80
        };

        new RangeWithInput(element, options);
    });
});

// Export for use in other modules
window.KrishyaSetu.RangeSlider = RangeSlider;
window.KrishyaSetu.DualRangeSlider = DualRangeSlider;
window.KrishyaSetu.RangeWithInput = RangeWithInput;
