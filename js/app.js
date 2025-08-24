// Main App Module - Core CRUD and Render Logic
console.log('App.js is loading...');

import { TaskStorage } from './storage.js';
import { Gamification } from './gamify.js';
import { QuickAdd } from './quickadd.js';
import { Filters } from './filters.js';
import { Dashboard } from './dashboard.js';
import { ThemeManager } from './theme.js';

class TaskApp {
    constructor() {
        this.storage = new TaskStorage();
        this.gamification = new Gamification();
        this.quickAdd = new QuickAdd();
        this.filters = new Filters();
        this.dashboard = new Dashboard();
        this.theme = new ThemeManager();
        
        this.tasks = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        this.init();
    }
    
    async init() {
        // Load saved data
        await this.loadTasks();
        
        // Initialize modules
        this.gamification.init(this);
        this.quickAdd.init(this);
        this.filters.init(this);
        this.dashboard.init(this);
        this.theme.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render initial state
        this.render();
        
        // Check for PWA install prompt
        this.setupPWA();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewName = e.currentTarget.dataset.view;
                if (viewName) {
                    this.switchView(viewName);
                }
            });
        });
        
        // Quick add form
        document.getElementById('quick-add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTaskFromInput();
        });
        
        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });
        
        // Settings
        this.setupSettingsListeners();
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Hide drag hint after user interaction
        this.setupDragHint();
    }
    
    setupSettingsListeners() {
        // Theme radio buttons
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.theme.setTheme(e.target.value);
            });
        });
        
        // Sound toggle
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            this.gamification.setSoundEnabled(e.target.checked);
        });
        
        // Export buttons
        document.getElementById('export-json').addEventListener('click', () => {
            this.exportData('json');
        });
        
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportData('csv');
        });
        
        // Import
        document.getElementById('import-json').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
        
        // Reset data
        document.getElementById('reset-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                this.resetData();
            }
        });
    }
    
    setupDragAndDrop() {
        const tasksList = document.getElementById('tasks-list');
        
        tasksList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            }
        });
        
        tasksList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
            }
        });
        
        tasksList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement) {
                const afterElement = this.getDragAfterElement(tasksList, e.clientY);
                if (afterElement) {
                    tasksList.insertBefore(draggingElement, afterElement);
                } else {
                    tasksList.appendChild(draggingElement);
                }
            }
            
            // Add visual feedback for drag over
            const taskItem = e.target.closest('.task-item');
            if (taskItem && !taskItem.classList.contains('dragging')) {
                taskItem.classList.add('drag-over');
            }
        });
        
        tasksList.addEventListener('dragleave', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('drag-over');
            }
        });
        
        tasksList.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            this.reorderTasks(taskId);
            
            // Remove drag over styling
            document.querySelectorAll('.task-item').forEach(item => {
                item.classList.remove('drag-over');
            });
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    async loadTasks() {
        this.tasks = await this.storage.getTasks();
    }
    
    async saveTasks() {
        await this.storage.saveTasks(this.tasks);
    }
    
    addTaskFromInput() {
        const input = document.getElementById('quick-add-input');
        const text = input.value.trim();
        
        if (text) {
            const parsedTask = this.quickAdd.parseInput(text);
            this.addTask(parsedTask);
            input.value = '';
        }
    }
    
    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            text: taskData.text,
            completed: false,
            createdAt: new Date().toISOString(),
            tags: taskData.tags || [],
            priority: taskData.priority || 'normal',
            dueDate: taskData.dueDate || null,
            recurring: taskData.recurring || null
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        
        // Gamification
        this.gamification.addTask(task);
        
        // Play sound
        this.gamification.playSound('tick');
    }
    
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.render();
            
            // Gamification
            if (task.completed) {
                this.gamification.completeTask(task);
                this.gamification.playSound('level');
                this.showConfetti();
            }
        }
    }
    
    updateTask(taskId, updates) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
            this.saveTasks();
            this.render();
        }
    }
    
    deleteTask(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.saveTasks();
            this.render();
        }
    }
    
    reorderTasks(taskId) {
        const taskElements = document.querySelectorAll('.task-item');
        const newOrder = Array.from(taskElements).map(el => el.dataset.taskId);
        
        // Reorder tasks array based on DOM order
        const reorderedTasks = [];
        newOrder.forEach(id => {
            const task = this.tasks.find(t => t.id === id);
            if (task) reorderedTasks.push(task);
        });
        
        this.tasks = reorderedTasks;
        this.saveTasks();
    }
    
    getFilteredTasks() {
        let filtered = this.tasks;
        
        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(task => 
                task.text.toLowerCase().includes(this.searchQuery) ||
                task.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // Apply status filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'priority':
                filtered = filtered.filter(task => task.priority === 'high');
                break;
        }
        
        return filtered;
    }
    
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-secondary');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${this.currentFilter}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('btn-outline-secondary');
            activeBtn.classList.add('active', 'btn-primary');
        }
    }
    
    render() {
        this.renderTasks();
        this.renderTagFilters();
        this.updateStats();
        this.dashboard.updateCharts(this.tasks);
        this.updateFilterButtons();
    }
    
    renderTasks() {
        const tasksList = document.getElementById('tasks-list');
        const filteredTasks = this.getFilteredTasks();
        
        tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <li class="list-group-item text-center py-5">
                    <div class="empty-message">
                        <i class="fas fa-inbox text-muted mb-3" style="font-size: 3rem;"></i>
                        <p class="text-muted mb-0">No tasks found</p>
                    </div>
                </li>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item list-group-item ${task.completed ? 'completed' : ''}`;
        li.draggable = true;
        li.dataset.taskId = task.id;
        
        const priorityIcon = task.priority === 'high' ? '<i class="fas fa-exclamation-triangle text-warning me-2"></i>' : '';
        const dueDateText = task.dueDate ? this.formatDate(task.dueDate) : '';
        
        li.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input task-checkbox" ${task.completed ? 'checked' : ''}>
                </div>
                <div class="task-content flex-grow-1">
                    <input type="text" class="form-control border-0 bg-transparent task-text" value="${this.escapeHtml(task.text)}" ${task.completed ? 'readonly' : ''} readonly>
                    <div class="task-meta d-flex align-items-center gap-2 mt-1">
                        ${priorityIcon}
                        ${task.tags.map(tag => `<span class="badge bg-primary">#${tag}</span>`).join('')}
                        ${dueDateText ? `<span class="text-muted small">${dueDateText}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions d-flex gap-1">
                    <button class="btn btn-sm btn-outline-secondary task-action edit" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger task-action delete" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        
        const textInput = li.querySelector('.task-text');
        const editBtn = li.querySelector('.edit');
        
        // Edit/Save functionality
        editBtn.addEventListener('click', () => {
            const isEditing = textInput.readOnly === false;
            
            if (isEditing) {
                // Save mode - save the changes
                const newText = textInput.value.trim();
                if (newText && newText !== task.text) {
                    this.updateTask(task.id, { text: newText });
                }
                
                // Switch back to view mode
                textInput.readOnly = true;
                textInput.classList.remove('editing');
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.title = 'Edit task';
                editBtn.classList.remove('btn-success');
                editBtn.classList.add('btn-outline-secondary');
            } else {
                // Edit mode - make text editable
                textInput.readOnly = false;
                textInput.classList.add('editing');
                textInput.focus();
                textInput.select();
                editBtn.innerHTML = '<i class="fas fa-save"></i>';
                editBtn.title = 'Save task';
                editBtn.classList.remove('btn-outline-secondary');
                editBtn.classList.add('btn-success');
            }
        });
        
        // Handle Enter key in edit mode
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !textInput.readOnly) {
                e.preventDefault();
                editBtn.click(); // Trigger save
            }
        });
        
        // Handle Escape key to cancel editing
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !textInput.readOnly) {
                e.preventDefault();
                textInput.value = task.text; // Restore original text
                editBtn.click(); // Switch back to view mode
            }
        });
        
        const deleteBtn = li.querySelector('.delete');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }
    
    renderTagFilters() {
        const tagFilters = document.getElementById('tag-filters');
        const allTags = [...new Set(this.tasks.flatMap(task => task.tags))];
        
        tagFilters.innerHTML = '';
        
        allTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn btn btn-outline-secondary btn-sm tag-filter';
            btn.textContent = `#${tag}`;
            btn.dataset.tag = tag;
            
            btn.addEventListener('click', () => {
                this.searchQuery = `#${tag}`;
                document.getElementById('search-input').value = this.searchQuery;
                this.render();
            });
            
            tagFilters.appendChild(btn);
        });
    }
    
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        
        // Update footer stats
        const stats = this.gamification.getStats();
        document.getElementById('footer-streak').textContent = `${stats.streak} day streak`;
        document.getElementById('footer-level').textContent = `Level ${stats.level}`;
    }
    
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
        
        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = this.theme.getCurrentTheme();
        themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    setupPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installBtn = document.getElementById('install-btn');
            installBtn.style.display = 'block';
            
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        installBtn.style.display = 'none';
                    }
                    deferredPrompt = null;
                }
            });
        });
    }
    
    exportData(format) {
        const data = {
            tasks: this.tasks,
            gamification: this.gamification.getStats(),
            exportDate: new Date().toISOString()
        };
        
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csvContent = this.convertToCSV(this.tasks);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }
    
    convertToCSV(tasks) {
        const headers = ['Text', 'Completed', 'Priority', 'Tags', 'Due Date', 'Created At'];
        const rows = tasks.map(task => [
            task.text,
            task.completed ? 'Yes' : 'No',
            task.priority,
            task.tags.join(', '),
            task.dueDate || '',
            task.createdAt
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
    
    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.tasks && Array.isArray(data.tasks)) {
                this.tasks = data.tasks;
                await this.saveTasks();
                this.render();
                
                if (data.gamification) {
                    this.gamification.importStats(data.gamification);
                }
                
                alert('Data imported successfully!');
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    }
    
    resetData() {
        this.tasks = [];
        this.gamification.reset();
        this.saveTasks();
        this.render();
        alert('All data has been reset!');
    }
    
    showConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#dc143c', '#5ffbf1', '#ff6b6b', '#51cf66', '#ffd43b'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString();
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    setupDragHint() {
        const dragHint = document.querySelector('.drag-hint');
        if (!dragHint) return;
        
        // Hide drag hint after user interaction
        let hideTimeout;
        
        const hideHint = () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                dragHint.style.opacity = '0.5';
            }, 5000); // Hide after 5 seconds of inactivity
        };
        
        const showHint = () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            dragHint.style.opacity = '1';
        };
        
        // Show hint on first drag
        const tasksList = document.getElementById('tasks-list');
        tasksList.addEventListener('dragstart', () => {
            showHint();
            hideHint();
        });
        
        // Show hint on first task add
        const originalAddTask = this.addTask.bind(this);
        this.addTask = function(taskData) {
            originalAddTask(taskData);
            showHint();
            hideHint();
        };
        
        // Initial hide timer
        hideHint();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, creating TaskApp...');
    window.taskApp = new TaskApp();
});
