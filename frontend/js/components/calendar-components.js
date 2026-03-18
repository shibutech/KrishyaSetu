/*
===========================================
KRISHYASETU CALENDAR COMPONENTS
===========================================
JavaScript calendar components for farming schedules
===========================================
*/

// ========================================
// BASE CALENDAR CLASS
// ========================================

class Calendar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            month: options.month || new Date().getMonth(),
            year: options.year || new Date().getFullYear(),
            selectedDate: options.selectedDate || null,
            events: options.events || [],
            onDateSelect: options.onDateSelect || (() => {}),
            onMonthChange: options.onMonthChange || (() => {}),
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            disabledDates: options.disabledDates || [],
            highlightToday: options.highlightToday !== false,
            showWeekNumbers: options.showWeekNumbers || false,
            firstDayOfWeek: options.firstDayOfWeek || 0, // 0 = Sunday, 1 = Monday
            ...options
        };
        
        this.currentDate = new Date(this.options.year, this.options.month, 1);
        this.selectedDate = this.options.selectedDate;
        this.events = this.options.events;
        
        this.init();
    }

    init() {
        this.createCalendar();
        this.bindEvents();
        this.render();
    }

    createCalendar() {
        // Ensure container exists
        if (!this.container) {
            console.error('Calendar container not found');
            return;
        }

        const calendarHTML = `
            <div class="calendar-header">
                <button class="calendar-nav-btn prev-month">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="calendar-today-btn today-btn">Today</button>
                <button class="calendar-nav-btn next-month">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-title"></div>
            <div class="calendar-weekdays"></div>
            <div class="calendar-grid"></div>
        `;
        
        try {
            this.container.innerHTML = calendarHTML;
            this.elements = {
                title: this.container.querySelector('.calendar-title'),
                prevBtn: this.container.querySelector('.prev-month'),
                todayBtn: this.container.querySelector('.today-btn'),
                nextBtn: this.container.querySelector('.next-month'),
                weekdays: this.container.querySelector('.calendar-weekdays'),
                grid: this.container.querySelector('.calendar-grid')
            };
        } catch (error) {
            console.error('Error creating calendar:', error);
        }
    }

    bindEvents() {
        // Ensure elements exist before binding events
        if (!this.elements.prevBtn || !this.elements.nextBtn || !this.elements.todayBtn) {
            console.error('Calendar elements not found, skipping event binding');
            return;
        }
        
        this.elements.prevBtn.addEventListener('click', () => this.previousMonth());
        this.elements.nextBtn.addEventListener('click', () => this.nextMonth());
        this.elements.todayBtn.addEventListener('click', () => this.goToToday());
    }

    render() {
        this.renderTitle();
        this.renderWeekdays();
        this.renderDays();
    }

    renderTitle() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.elements.title.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderWeekdays() {
        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdaysHTML = weekdayNames.map((day, index) => {
            const isWeekend = index === 0 || index === 6;
            return `<div class="calendar-weekday ${isWeekend ? 'weekend' : ''}">${day}</div>`;
        }).join('');
        
        this.elements.weekdays.innerHTML = weekdaysHTML;
    }

    renderDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Get first day of month and adjust for firstDayOfWeek
        const firstDay = new Date(year, month, 1).getDay();
        const adjustedFirstDay = (firstDay - this.options.firstDayOfWeek + 7) % 7;
        
        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get number of days in previous month
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        // Calculate grid dimensions
        const totalCells = Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7;
        
        let daysHTML = '';
        
        for (let i = 0; i < totalCells; i++) {
            const dayNumber = i - adjustedFirstDay + 1;
            let date = null;
            let className = 'calendar-day';
            let content = '';
            
            if (dayNumber > 0 && dayNumber <= daysInMonth) {
                // Current month
                date = new Date(year, month, dayNumber);
                
                // Check if today
                const today = new Date();
                if (this.options.highlightToday && 
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()) {
                    className += ' today';
                }
                
                // Check if selected
                if (this.selectedDate && 
                    date.getDate() === this.selectedDate.getDate() &&
                    date.getMonth() === this.selectedDate.getMonth() &&
                    date.getFullYear() === this.selectedDate.getFullYear()) {
                    className += ' selected';
                }
                
                // Check if disabled
                if (this.isDateDisabled(date)) {
                    className += ' disabled';
                }
                
                // Add events
                const dayEvents = this.getEventsForDate(date);
                if (dayEvents.length > 0) {
                    content += `<div class="calendar-day-number">${dayNumber}</div>`;
                    content += '<div class="calendar-day-events" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">';
                    dayEvents.slice(0, 4).forEach(event => {
                        content += `<div class="calendar-event-pill ${event.type}" style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; cursor: pointer;" title="${event.title}">
                            <span class="calendar-event-dot ${event.type}" style="width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1);"></span>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-secondary); max-width: 100%;">${event.title}</span>
                        </div>`;
                    });
                    if (dayEvents.length > 4) {
                       content += `<div style="font-size: 10px; color: var(--text-muted); margin-left: 14px;">+${dayEvents.length - 4} more</div>`;
                    }
                    content += '</div>';
                } else {
                    content = `<div class="calendar-day-number">${dayNumber}</div>`;
                }
                
            } else if (dayNumber <= 0) {
                // Previous month
                const prevDay = daysInPrevMonth + dayNumber;
                date = new Date(year, month - 1, prevDay);
                className += ' other-month';
                content = `<div class="calendar-day-number">${prevDay}</div>`;
                
            } else {
                // Next month
                const nextDay = dayNumber - daysInMonth;
                date = new Date(year, month + 1, nextDay);
                className += ' other-month';
                content = `<div class="calendar-day-number">${nextDay}</div>`;
            }
            
            daysHTML += `<div class="${className}" data-date="${date ? date.toISOString() : ''}">${content}</div>`;
        }
        
        this.elements.grid.innerHTML = daysHTML;
        
        // Bind click events to days
        this.elements.grid.querySelectorAll('.calendar-day:not(.disabled)').forEach(day => {
            day.addEventListener('click', () => {
                const dateStr = day.dataset.date;
                if (dateStr) {
                    const date = new Date(dateStr);
                    this.selectDate(date);
                }
            });
        });
    }

    isDateDisabled(date) {
        // Check min/max dates
        if (this.options.minDate && date < this.options.minDate) return true;
        if (this.options.maxDate && date > this.options.maxDate) return true;
        
        // Check disabled dates
        return this.options.disabledDates.some(disabledDate => 
            date.getDate() === disabledDate.getDate() &&
            date.getMonth() === disabledDate.getMonth() &&
            date.getFullYear() === disabledDate.getFullYear()
        );
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === date.getDate() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getFullYear() === date.getFullYear();
        });
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.options.onDateSelect(date);
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.options.onMonthChange(this.currentDate);
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.options.onMonthChange(this.currentDate);
    }

    goToToday() {
        const today = new Date();
        this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.selectDate(today);
    }

    setEvents(events) {
        this.events = events;
        this.render();
    }

    addEvent(event) {
        this.events.push(event);
        this.render();
    }

    removeEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        this.render();
    }
}

// ========================================
// FARMING CALENDAR CLASS
// ========================================

class FarmingCalendar extends Calendar {
    constructor(container, options = {}) {
        super(container, {
            ...options,
            showWeekNumbers: true,
            highlightToday: true
        });
        
        this.crops = options.crops || [];
        this.farmingEvents = [];
        
        this.initFarmingCalendar();
    }

    initFarmingCalendar() {
        this.generateFarmingEvents();
        this.setEvents(this.farmingEvents);
    }

    generateFarmingEvents() {
        this.farmingEvents = [];
        
        this.crops.forEach(crop => {
            if (crop.plantingDate) {
                const plantingDate = new Date(crop.plantingDate);
                this.farmingEvents.push({
                    id: `planting-${crop.id}`,
                    title: `Plant ${crop.name}`,
                    date: plantingDate,
                    type: 'planting',
                    description: `Planting season for ${crop.name}`,
                    crop: crop
                });
                
                // Add watering schedule (every 3 days)
                for (let i = 1; i <= 30; i += 3) {
                    const wateringDate = new Date(plantingDate);
                    wateringDate.setDate(wateringDate.getDate() + i);
                    
                    this.farmingEvents.push({
                        id: `watering-${crop.id}-${i}`,
                        title: `Water ${crop.name}`,
                        date: wateringDate,
                        type: 'watering',
                        description: `Regular watering for ${crop.name}`,
                        crop: crop
                    });
                }
                
                // Add fertilizing schedule (every 2 weeks)
                for (let i = 14; i <= 90; i += 14) {
                    const fertilizingDate = new Date(plantingDate);
                    fertilizingDate.setDate(fertilizingDate.getDate() + i);
                    
                    this.farmingEvents.push({
                        id: `fertilizing-${crop.id}-${i}`,
                        title: `Fertilize ${crop.name}`,
                        date: fertilizingDate,
                        type: 'fertilizing',
                        description: `Fertilizing schedule for ${crop.name}`,
                        crop: crop
                    });
                }
                
                // Add estimated harvest date
                if (crop.harvestDays) {
                    const harvestDate = new Date(plantingDate);
                    harvestDate.setDate(harvestDate.getDate() + crop.harvestDays);
                    
                    this.farmingEvents.push({
                        id: `harvest-${crop.id}`,
                        title: `Harvest ${crop.name}`,
                        date: harvestDate,
                        type: 'harvesting',
                        description: `Expected harvest time for ${crop.name}`,
                        crop: crop
                    });
                }
            }
        });
    }

    setCrops(crops) {
        this.crops = crops;
        this.generateFarmingEvents();
    }

    addCrop(crop) {
        this.crops.push(crop);
        this.generateFarmingEvents();
    }

    removeCrop(cropId) {
        this.crops = this.crops.filter(crop => crop.id !== cropId);
        this.generateFarmingEvents();
    }
}

// ========================================
// EVENT CALENDAR CLASS
// ========================================

class EventCalendar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            events: options.events || [],
            onEventClick: options.onEventClick || (() => {}),
            onDateClick: options.onDateClick || (() => {}),
            view: options.view || 'month', // month, week, day
            ...options
        };
        
        this.events = this.options.events;
        this.currentDate = new Date();
        this.currentView = this.options.view;
        
        this.init();
    }

    init() {
        this.createEventCalendar();
        this.bindEvents();
        this.render();
    }

    createEventCalendar() {
        const calendarHTML = `
            <div class="event-calendar">
                <div class="event-calendar-header">
                    <h3 class="event-calendar-title">Farming Events</h3>
                    <div class="calendar-navigation">
                        <button class="calendar-nav-btn prev-view">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="calendar-nav-btn today-btn">Today</button>
                        <button class="calendar-nav-btn next-view">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="event-calendar-body">
                    <div class="event-list"></div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = calendarHTML;
        this.elements = {
            title: this.container.querySelector('.event-calendar-title'),
            prevBtn: this.container.querySelector('.prev-view'),
            todayBtn: this.container.querySelector('.today-btn'),
            nextBtn: this.container.querySelector('.next-view'),
            eventList: this.container.querySelector('.event-list')
        };
    }

    bindEvents() {
        this.elements.prevBtn.addEventListener('click', () => this.previous());
        this.elements.nextBtn.addEventListener('click', () => this.next());
        this.elements.todayBtn.addEventListener('click', () => this.goToToday());
    }

    render() {
        this.renderTitle();
        this.renderEvents();
    }

    renderTitle() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.elements.title.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderEvents() {
        const events = this.getEventsForCurrentPeriod();
        
        if (events.length === 0) {
            this.elements.eventList.innerHTML = `
                <div class="calendar-empty">
                    <div class="calendar-empty-icon">
                        <i class="fas fa-calendar-times"></i>
                    </div>
                    <h4 class="calendar-empty-title">No Events</h4>
                    <p class="calendar-empty-description">No farming events scheduled for this period</p>
                </div>
            `;
            return;
        }
        
        const eventsHTML = events.map(event => this.renderEvent(event)).join('');
        this.elements.eventList.innerHTML = eventsHTML;
        
        // Bind click events
        this.elements.eventList.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', () => {
                const eventId = item.dataset.eventId;
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.options.onEventClick(event);
                }
            });
        });
    }

    renderEvent(event) {
        const eventDate = new Date(event.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
        
        const eventIcon = this.getEventIcon(event.type);
        
        return `
            <div class="event-item ${event.type}" data-event-id="${event.id}">
                <div class="event-date">
                    <div class="event-day">${day}</div>
                    <div class="event-month">${month}</div>
                </div>
                <div class="event-content">
                    <h4 class="event-title">${event.title}</h4>
                    <p class="event-description">${event.description || ''}</p>
                    <div class="event-time">
                        <i class="fas fa-clock event-icon"></i>
                        ${this.formatEventTime(event)}
                    </div>
                </div>
            </div>
        `;
    }

    getEventIcon(type) {
        const icons = {
            planting: 'fas fa-seedling',
            harvesting: 'fas fa-wheat',
            watering: 'fas fa-tint',
            fertilizing: 'fas fa-flask',
            'pest-control': 'fas fa-bug',
            weather: 'fas fa-cloud-sun',
            market: 'fas fa-store',
            default: 'fas fa-calendar'
        };
        return icons[type] || icons.default;
    }

    formatEventTime(event) {
        if (event.time) {
            return new Date(event.time).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        return 'All day';
    }

    getEventsForCurrentPeriod() {
        const start = new Date(this.currentDate);
        const end = new Date(this.currentDate);
        
        if (this.currentView === 'month') {
            start.setDate(1);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
        } else if (this.currentView === 'week') {
            const dayOfWeek = start.getDay();
            start.setDate(start.getDate() - dayOfWeek);
            end.setDate(start.getDate() + 6);
        } else {
            // day view
            end.setDate(start.getDate() + 1);
        }
        
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= start && eventDate <= end;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    previous() {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
        }
        this.render();
    }

    next() {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
        }
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    setEvents(events) {
        this.events = events;
        this.render();
    }

    addEvent(event) {
        this.events.push(event);
        this.render();
    }

    removeEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        this.render();
    }

    setView(view) {
        this.currentView = view;
        this.render();
    }
}

// ========================================
// DATE PICKER CLASS
// ========================================

class DatePicker {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            date: options.date || new Date(),
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            format: options.format || 'YYYY-MM-DD',
            onDateSelect: options.onDateSelect || (() => {}),
            inline: options.inline || false,
            ...options
        };
        
        this.selectedDate = this.options.date;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.createDatePicker();
        this.bindEvents();
        this.render();
    }

    createDatePicker() {
        if (this.options.inline) {
            this.container.innerHTML = `
                <div class="date-picker">
                    <div class="date-picker-header">
                        <h4 class="date-picker-title">Select Date</h4>
                    </div>
                    <div class="date-picker-grid"></div>
                    <div class="date-picker-footer">
                        <input type="text" class="date-picker-input" readonly>
                        <div class="date-picker-actions">
                            <button class="btn btn-sm btn-secondary clear-btn">Clear</button>
                            <button class="btn btn-sm btn-primary ok-btn">OK</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            this.container.innerHTML = `
                <div class="date-picker-input-wrapper">
                    <input type="text" class="date-picker-input" readonly placeholder="Select date">
                    <button class="date-picker-toggle toggle-picker">
                        <i class="fas fa-calendar"></i>
                    </button>
                </div>
                <div class="date-picker-popup" style="display: none;">
                    <div class="date-picker">
                        <div class="date-picker-header">
                            <h4 class="date-picker-title">Select Date</h4>
                            <div class="calendar-navigation">
                                <button class="calendar-nav-btn prev-month">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="calendar-nav-btn next-month">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="date-picker-grid"></div>
                        <div class="date-picker-footer">
                            <div class="date-picker-actions">
                                <button class="btn btn-sm btn-secondary clear-btn">Clear</button>
                                <button class="btn btn-sm btn-primary today-btn">Today</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.elements = {
            input: this.container.querySelector('.date-picker-input'),
            grid: this.container.querySelector('.date-picker-grid'),
            title: this.container.querySelector('.date-picker-title'),
            prevBtn: this.container.querySelector('.prev-month'),
            nextBtn: this.container.querySelector('.next-month'),
            clearBtn: this.container.querySelector('.clear-btn'),
            todayBtn: this.container.querySelector('.today-btn'),
            okBtn: this.container.querySelector('.ok-btn'),
            toggleBtn: this.container.querySelector('.toggle-picker'),
            popup: this.container.querySelector('.date-picker-popup')
        };
        
        this.currentDate = new Date(this.selectedDate);
    }

    bindEvents() {
        if (!this.options.inline) {
            this.elements.toggleBtn.addEventListener('click', () => this.toggle());
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!this.container.contains(e.target)) {
                    this.close();
                }
            });
        }
        
        this.elements.prevBtn.addEventListener('click', () => this.previousMonth());
        this.elements.nextBtn.addEventListener('click', () => this.nextMonth());
        this.elements.clearBtn.addEventListener('click', () => this.clear());
        this.elements.todayBtn.addEventListener('click', () => this.selectToday());
        
        if (this.elements.okBtn) {
            this.elements.okBtn.addEventListener('click', () => this.confirm());
        }
    }

    render() {
        this.renderTitle();
        this.renderDays();
        this.updateInput();
    }

    renderTitle() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.elements.title.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        
        let daysHTML = '';
        
        for (let i = 0; i < totalCells; i++) {
            const dayNumber = i - firstDay + 1;
            let className = 'date-picker-day';
            let content = '';
            
            if (dayNumber > 0 && dayNumber <= daysInMonth) {
                const date = new Date(year, month, dayNumber);
                
                // Check if today
                const today = new Date();
                if (date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()) {
                    className += ' today';
                }
                
                // Check if selected
                if (this.selectedDate && 
                    date.getDate() === this.selectedDate.getDate() &&
                    date.getMonth() === this.selectedDate.getMonth() &&
                    date.getFullYear() === this.selectedDate.getFullYear()) {
                    className += ' selected';
                }
                
                // Check if disabled
                if (this.isDateDisabled(date)) {
                    className += ' disabled';
                }
                
                content = dayNumber;
                
            } else if (dayNumber <= 0) {
                className += ' other-month';
                content = daysInPrevMonth + dayNumber;
            } else {
                className += ' other-month';
                content = dayNumber - daysInMonth;
            }
            
            daysHTML += `<div class="${className}">${content}</div>`;
        }
        
        this.elements.grid.innerHTML = daysHTML;
        
        // Bind click events
        this.elements.grid.querySelectorAll('.date-picker-day:not(.disabled)').forEach(day => {
            day.addEventListener('click', () => {
                const dayNumber = parseInt(day.textContent);
                if (!isNaN(dayNumber)) {
                    const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), dayNumber);
                    this.selectDate(date);
                }
            });
        });
    }

    isDateDisabled(date) {
        if (this.options.minDate && date < this.options.minDate) return true;
        if (this.options.maxDate && date > this.options.maxDate) return true;
        return false;
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();
        
        if (this.options.inline) {
            this.options.onDateSelect(date);
        }
    }

    selectToday() {
        this.selectDate(new Date());
        if (!this.options.inline) {
            this.close();
        }
    }

    clear() {
        this.selectedDate = null;
        this.render();
        this.options.onDateSelect(null);
        
        if (!this.options.inline) {
            this.close();
        }
    }

    confirm() {
        this.options.onDateSelect(this.selectedDate);
        this.close();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.elements.popup.style.display = 'block';
        this.render();
    }

    close() {
        this.isOpen = false;
        this.elements.popup.style.display = 'none';
    }

    updateInput() {
        if (this.selectedDate) {
            this.elements.input.value = this.formatDate(this.selectedDate);
        } else {
            this.elements.input.value = '';
        }
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return this.options.format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }

    setDate(date) {
        this.selectedDate = date;
        this.currentDate = new Date(date);
        this.render();
    }

    getDate() {
        return this.selectedDate;
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize calendars when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize calendars with data attributes
    document.querySelectorAll('[data-calendar]').forEach(element => {
        const options = {
            events: element.dataset.events ? JSON.parse(element.dataset.events) : [],
            month: element.dataset.month ? parseInt(element.dataset.month) : undefined,
            year: element.dataset.year ? parseInt(element.dataset.year) : undefined
        };
        
        new Calendar(element, options);
    });
    
    // Auto-initialize farming calendars
    document.querySelectorAll('[data-farming-calendar]').forEach(element => {
        const options = {
            crops: element.dataset.crops ? JSON.parse(element.dataset.crops) : []
        };
        
        new FarmingCalendar(element, options);
    });
    
    // Auto-initialize event calendars
    document.querySelectorAll('[data-event-calendar]').forEach(element => {
        const options = {
            events: element.dataset.events ? JSON.parse(element.dataset.events) : []
        };
        
        new EventCalendar(element, options);
    });
    
    // Auto-initialize date pickers
    document.querySelectorAll('[data-date-picker]').forEach(element => {
        const options = {
            date: element.dataset.date ? new Date(element.dataset.date) : new Date(),
            minDate: element.dataset.minDate ? new Date(element.dataset.minDate) : null,
            maxDate: element.dataset.maxDate ? new Date(element.dataset.maxDate) : null,
            inline: element.dataset.inline === 'true'
        };
        
        new DatePicker(element, options);
    });
});

// Export for use in other modules
window.KrishyaSetu.Calendar = Calendar;
window.KrishyaSetu.FarmingCalendar = FarmingCalendar;
window.KrishyaSetu.EventCalendar = EventCalendar;
window.KrishyaSetu.DatePicker = DatePicker;
