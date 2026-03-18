/*
===========================================
KRISHYASETU TASK MANAGEMENT COMPONENTS
===========================================
JavaScript components for farming tasks and activities
===========================================
*/

// ========================================
// TASK MANAGER CLASS
// ========================================

class TaskManager {
    constructor(options = {}) {
        this.options = {
            storageKey: 'krishyasetu-tasks',
            onTaskAdd: options.onTaskAdd || (() => {}),
            onTaskUpdate: options.onTaskUpdate || (() => {}),
            onTaskDelete: options.onTaskDelete || (() => {}),
            onTaskComplete: options.onTaskComplete || (() => {}),
            ...options
        };
        
        this.tasks = this.loadTasks();
        this.filters = {
            type: 'all',
            priority: 'all',
            status: 'all',
            date: 'all'
        };

        this.limit = options.limit || null;
        this.showAll = options.showAll !== undefined ? options.showAll : true;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
    }

    bindEvents() {
        // Auto-save on changes
        window.addEventListener('beforeunload', () => {
            this.saveTasks();
        });
    }

    // Task CRUD Operations
    addTask(task) {
        const newTask = {
            id: this.generateTaskId(),
            title: task.title || '',
            description: task.description || '',
            type: task.type || 'general',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            date: task.date || new Date().toISOString(),
            time: task.time || '',
            repeat: task.repeat || 'none',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...task
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.options.onTaskAdd(newTask);
        
        return newTask;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveTasks();
            this.renderTasks();
            this.options.onTaskUpdate(this.tasks[taskIndex]);
            
            return this.tasks[taskIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const deletedTask = this.tasks.splice(taskIndex, 1)[0];
            this.saveTasks();
            this.renderTasks();
            this.options.onTaskDelete(deletedTask);
            
            return deletedTask;
        }
        return null;
    }

    completeTask(taskId) {
        const task = this.updateTask(taskId, {
            completed: true,
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        
        if (task) {
            this.options.onTaskComplete(task);
        }
        
        return task;
    }

    // Task Filtering
    filterTasks(filters = {}) {
        this.filters = { ...this.filters, ...filters };
        this.renderTasks();
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            // Type filter
            if (this.filters.type !== 'all' && task.type !== this.filters.type) {
                return false;
            }
            
            // Priority filter
            if (this.filters.priority !== 'all' && task.priority !== this.filters.priority) {
                return false;
            }
            
            // Status filter
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'completed' && !task.completed) {
                    return false;
                }
                if (this.filters.status === 'pending' && task.completed) {
                    return false;
                }
            }
            
            // Date filter
            if (this.filters.date !== 'all') {
                const taskDate = new Date(task.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (this.filters.date === 'today') {
                    const taskDay = new Date(taskDate);
                    taskDay.setHours(0, 0, 0, 0);
                    return taskDay.getTime() === today.getTime();
                }
                
                if (this.filters.date === 'upcoming') {
                    return taskDate >= today;
                }
                
                if (this.filters.date === 'overdue') {
                    return taskDate < today && !task.completed;
                }
            }
            
            return true;
        });
    }

    // Task Statistics
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdue = this.tasks.filter(task => {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate < today && !task.completed;
        }).length;
        
        return {
            total,
            completed,
            pending,
            overdue
        };
    }

    // Rendering
    renderTasks() {
        const container = document.querySelector('[data-task-list]');
        if (!container) return;
        
        let tasksToRender = this.getFilteredTasks();
        
        if (tasksToRender.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // Apply limit if enabled
        if (this.limit && !this.showAll) {
            tasksToRender = tasksToRender.slice(0, this.limit);
        }
        
        const tasksHTML = tasksToRender.map(task => this.renderTask(task)).join('');
        container.innerHTML = tasksHTML;
        
        this.bindTaskEvents();
    }

    renderTask(task) {
        const priorityClass = `${task.priority}-priority`;
        const completedClass = task.completed ? 'completed' : '';
        const typeIcon = this.getTaskTypeIcon(task.type);
        
        return `
            <div class="task-item ${priorityClass} ${completedClass}" data-task-id="${task.id}">
                <div class="task-item-header">
                    <h4 class="task-item-title">${task.title}</h4>
                    <div class="task-item-actions">
                        ${!task.completed ? `
                            <button class="task-item-action complete" data-action="complete" title="Complete">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="task-item-action edit" data-action="edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-item-action delete" data-action="delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-item-content">
                    ${task.description ? `<p class="task-item-description">${task.description}</p>` : ''}
                    <div class="task-item-meta">
                        <div class="task-item-type ${task.type}">
                            <i class="${typeIcon}"></i>
                            <span>${this.getTaskTypeName(task.type)}</span>
                        </div>
                        <div class="task-item-date">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(task.date)}</span>
                        </div>
                        ${task.time ? `
                            <div class="task-item-time">
                                <i class="fas fa-clock"></i>
                                <span>${task.time}</span>
                            </div>
                        ` : ''}
                        ${task.repeat !== 'none' ? `
                            <div class="task-item-repeat">
                                <i class="fas fa-redo"></i>
                                <span>${task.repeat}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="calendar-empty">
                <div class="calendar-empty-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <h4 class="calendar-empty-title">No Tasks</h4>
                <p class="calendar-empty-description">No farming tasks found. Add your first task to get started!</p>
            </div>
        `;
    }

    bindTaskEvents() {
        document.querySelectorAll('.task-item-action').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = button.closest('.task-item').dataset.taskId;
                const action = button.dataset.action;
                
                switch (action) {
                    case 'complete':
                        this.completeTask(taskId);
                        break;
                    case 'edit':
                        this.editTask(taskId);
                        break;
                    case 'delete':
                        this.deleteTask(taskId);
                        break;
                }
            });
        });
        
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.dataset.taskId;
                this.viewTask(taskId);
            });
        });
    }

    // Task Form Management
    showTaskForm(task = null) {
        const modal = new window.KrishyaSetu.Modal({
            title: task ? 'Edit Task' : 'Add New Task',
            content: this.renderTaskForm(task),
            size: 'medium'
        });
        
        modal.open();
        
        // Bind form events
        setTimeout(() => {
            this.bindTaskFormEvents(task);
        }, 100);
    }

    renderTaskForm(task = null) {
        const taskTypes = [
            { value: 'planting', name: 'Planting', icon: 'fas fa-seedling' },
            { value: 'watering', name: 'Watering', icon: 'fas fa-tint' },
            { value: 'fertilizing', name: 'Fertilizing', icon: 'fas fa-flask' },
            { value: 'harvesting', name: 'Harvesting', icon: 'fas fa-wheat' },
            { value: 'pest-control', name: 'Pest Control', icon: 'fas fa-bug' },
            { value: 'general', name: 'General', icon: 'fas fa-tasks' }
        ];
        
        const priorities = [
            { value: 'high', name: 'High', color: 'var(--error)' },
            { value: 'medium', name: 'Medium', color: 'var(--warning)' },
            { value: 'low', name: 'Low', color: 'var(--success)' }
        ];
        
        const repeatOptions = [
            { value: 'none', name: 'No Repeat' },
            { value: 'daily', name: 'Daily' },
            { value: 'weekly', name: 'Weekly' },
            { value: 'monthly', name: 'Monthly' }
        ];
        
        return `
            <form class="task-form" id="task-form">
                <div class="task-form-group">
                    <label class="task-form-label required">Task Title</label>
                    <input type="text" class="task-form-input" name="title" value="${task?.title || ''}" required>
                </div>
                
                <div class="task-form-group">
                    <label class="task-form-label">Description</label>
                    <textarea class="task-form-textarea" name="description">${task?.description || ''}</textarea>
                </div>
                
                <div class="task-form-group">
                    <label class="task-form-label required">Task Type</label>
                    <div class="task-type-selector">
                        ${taskTypes.map(type => `
                            <div class="task-type-option ${task?.type === type.value ? 'selected' : ''}" data-type="${type.value}">
                                <div class="task-type-icon">
                                    <i class="${type.icon}"></i>
                                </div>
                                <div class="task-type-name">${type.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="task-form-group">
                    <label class="task-form-label required">Priority</label>
                    <div class="task-priority-selector">
                        ${priorities.map(priority => `
                            <div class="task-priority-option ${priority.value} ${task?.priority === priority.value ? 'selected' : ''}" data-priority="${priority.value}">
                                ${priority.name}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="task-datetime-group">
                    <div class="task-form-group">
                        <label class="task-form-label required">Date</label>
                        <input type="date" class="task-form-input" name="date" value="${task?.date ? task.date.split('T')[0] : ''}" required>
                    </div>
                    
                    <div class="task-form-group">
                        <label class="task-form-label">Time</label>
                        <input type="time" class="task-form-input" name="time" value="${task?.time || ''}">
                    </div>
                </div>
                
                <div class="task-form-group">
                    <label class="task-form-label">Repeat</label>
                    <div class="task-repeat-options">
                        ${repeatOptions.map(option => `
                            <div class="task-repeat-option ${task?.repeat === option.value ? 'selected' : ''}" data-repeat="${option.value}">
                                <div class="task-repeat-checkbox"></div>
                                <div class="task-repeat-label">${option.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="task-form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">${task ? 'Update' : 'Add'} Task</button>
                </div>
            </form>
        `;
    }

    bindTaskFormEvents(task = null) {
        const form = document.getElementById('task-form');
        const cancelBtn = document.getElementById('cancel-btn');
        
        // Task type selection
        document.querySelectorAll('.task-type-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.task-type-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Priority selection
        document.querySelectorAll('.task-priority-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.task-priority-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Repeat selection
        document.querySelectorAll('.task-repeat-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.task-repeat-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const selectedType = document.querySelector('.task-type-option.selected');
            const selectedPriority = document.querySelector('.task-priority-option.selected');
            const selectedRepeat = document.querySelector('.task-repeat-option.selected');
            
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                type: selectedType ? selectedType.dataset.type : 'general',
                priority: selectedPriority ? selectedPriority.dataset.priority : 'medium',
            date: formData.get('date'),
                time: formData.get('time'),
                repeat: selectedRepeat ? selectedRepeat.dataset.repeat : 'none'
            };
            
            if (task && task.id) {
                this.updateTask(task.id, taskData);
            } else {
                this.addTask(taskData);
            }
            
            // Close modal
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                modal.remove();
            }
        });
        
        // Cancel button
        cancelBtn.addEventListener('click', () => {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                modal.remove();
            }
        });
    }

    // Task Actions
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.showTaskForm(task);
        }
    }

    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            // Show task details modal
            const modal = new window.KrishyaSetu.Modal({
                title: task.title,
                content: this.renderTaskDetails(task),
                size: 'small'
            });
            modal.open();
        }
    }

    renderTaskDetails(task) {
        return `
            <div class="task-details">
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-meta">
                    <div class="task-detail">
                        <strong>Type:</strong> ${this.getTaskTypeName(task.type)}
                    </div>
                    <div class="task-detail">
                        <strong>Priority:</strong> ${task.priority}
                    </div>
                    <div class="task-detail">
                        <strong>Date:</strong> ${this.formatDate(task.date)}
                    </div>
                    ${task.time ? `
                        <div class="task-detail">
                            <strong>Time:</strong> ${task.time}
                        </div>
                    ` : ''}
                    ${task.repeat !== 'none' ? `
                        <div class="task-detail">
                            <strong>Repeat:</strong> ${task.repeat}
                        </div>
                    ` : ''}
                    <div class="task-detail">
                        <strong>Status:</strong> ${task.completed ? 'Completed' : 'Pending'}
                    </div>
                </div>
                <div class="task-actions">
                    ${!task.completed ? `
                        <button class="btn btn-primary" onclick="taskManager.completeTask('${task.id}')">
                            <i class="fas fa-check"></i> Complete
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="taskManager.editTask('${task.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline" onclick="taskManager.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Utility Methods
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getTaskTypeIcon(type) {
        const icons = {
            planting: 'fas fa-seedling',
            watering: 'fas fa-tint',
            fertilizing: 'fas fa-flask',
            harvesting: 'fas fa-wheat',
            'pest-control': 'fas fa-bug',
            general: 'fas fa-tasks'
        };
        return icons[type] || icons.general;
    }

    getTaskTypeName(type) {
        const names = {
            planting: 'Planting',
            watering: 'Watering',
            fertilizing: 'Fertilizing',
            harvesting: 'Harvesting',
            'pest-control': 'Pest Control',
            general: 'General'
        };
        return names[type] || names.general;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Storage Methods
    saveTasks() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.warn('Failed to save tasks:', error);
        }
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load tasks:', error);
            return [];
        }
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================

// Initialize task components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize task managers
    document.querySelectorAll('[data-task-manager]').forEach(element => {
        const taskManager = new TaskManager();
        
        // Make task manager globally accessible
        window.taskManager = taskManager;
        
        // Bind add task button
        const addTaskBtn = element.querySelector('[data-add-task-btn]');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                taskManager.showTaskForm();
            });
        }
    });
    
    // Auto-initialize task filters
    document.querySelectorAll('[data-task-filter]').forEach(element => {
        const filterOptions = element.querySelectorAll('.task-filter-option');
        
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const filterType = option.dataset.filterType;
                const filterValue = option.dataset.filterValue;
                
                // Update active state
                filterOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Apply filter
                if (window.taskManager) {
                    window.taskManager.filterTasks({
                        [filterType]: filterValue
                    });
                }
            });
        });
    });
    
    // Initialize quick task actions
    document.querySelectorAll('[data-quick-task]').forEach(element => {
        element.addEventListener('click', () => {
            const taskType = element.dataset.taskType || 'general';
            const taskTitle = element.dataset.taskTitle || 'New Task';
            
            if (window.taskManager) {
                window.taskManager.showTaskForm({
                    title: taskTitle,
                    type: taskType
                });
            }
        });
    });
});

// Export for use in other modules
window.KrishyaSetu.TaskManager = TaskManager;
