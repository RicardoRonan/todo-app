// Filters Module - Search, Filtering, and Tag Management
export class Filters {
    constructor() {
        this.app = null;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.activeTags = new Set();
    }
    
    init(app) {
        this.app = app;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                if (filter) {
                    this.setFilter(filter);
                }
            });
        });
        
        // Tag filters (dynamic)
        this.setupTagFilterListeners();
    }
    
    setupTagFilterListeners() {
        // This will be called when tag filters are rendered
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter')) {
                const tag = e.target.dataset.tag;
                if (tag) {
                    this.toggleTagFilter(tag);
                }
            }
        });
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.applyFilters();
    }
    
    toggleTagFilter(tag) {
        if (this.activeTags.has(tag)) {
            this.activeTags.delete(tag);
        } else {
            this.activeTags.add(tag);
        }
        
        this.updateTagFilterButtons();
        this.applyFilters();
    }
    
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${this.currentFilter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    updateTagFilterButtons() {
        document.querySelectorAll('.tag-filter').forEach(btn => {
            const tag = btn.dataset.tag;
            btn.classList.toggle('active', this.activeTags.has(tag));
        });
    }
    
    applyFilters() {
        if (!this.app) return;
        
        const filteredTasks = this.getFilteredTasks();
        this.renderFilteredTasks(filteredTasks);
        this.updateFilterStats(filteredTasks);
    }
    
    getFilteredTasks() {
        if (!this.app || !this.app.tasks) return [];
        
        let filtered = [...this.app.tasks];
        
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
        
        // Apply tag filters
        if (this.activeTags.size > 0) {
            filtered = filtered.filter(task => 
                task.tags.some(tag => this.activeTags.has(tag))
            );
        }
        
        return filtered;
    }
    
    renderFilteredTasks(filteredTasks) {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;
        
        tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <li class="task-item empty-state">
                    <div class="empty-message">
                        <i class="fas fa-search"></i>
                        <p>No tasks found</p>
                        <small>Try adjusting your filters or search terms</small>
                    </div>
                </li>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.app.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    updateFilterStats(filteredTasks) {
        const totalTasks = this.app.tasks.length;
        const filteredCount = filteredTasks.length;
        
        // Update search results count if there's a search query
        if (this.searchQuery) {
            this.showSearchResults(filteredCount, totalTasks);
        } else {
            this.hideSearchResults();
        }
    }
    
    showSearchResults(filteredCount, totalTasks) {
        let resultsIndicator = document.getElementById('search-results-indicator');
        
        if (!resultsIndicator) {
            resultsIndicator = document.createElement('div');
            resultsIndicator.id = 'search-results-indicator';
            resultsIndicator.className = 'search-results-indicator';
            
            const searchBox = document.querySelector('.search-box');
            if (searchBox) {
                searchBox.appendChild(resultsIndicator);
            }
        }
        
        resultsIndicator.innerHTML = `
            <span class="results-count">
                ${filteredCount} of ${totalTasks} tasks
            </span>
            <button class="clear-search" title="Clear search">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        resultsIndicator.style.display = 'flex';
        
        // Add clear search functionality
        const clearBtn = resultsIndicator.querySelector('.clear-search');
        clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });
    }
    
    hideSearchResults() {
        const resultsIndicator = document.getElementById('search-results-indicator');
        if (resultsIndicator) {
            resultsIndicator.style.display = 'none';
        }
    }
    
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchQuery = '';
        this.hideSearchResults();
        this.applyFilters();
    }
    
    renderTagFilters() {
        const tagFilters = document.getElementById('tag-filters');
        if (!tagFilters) return;
        
        const allTags = this.getAllTags();
        
        tagFilters.innerHTML = '';
        
        allTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = `filter-btn tag-filter ${this.activeTags.has(tag) ? 'active' : ''}`;
            btn.textContent = `#${tag}`;
            btn.dataset.tag = tag;
            
            tagFilters.appendChild(btn);
        });
    }
    
    getAllTags() {
        if (!this.app || !this.app.tasks) return [];
        
        const allTags = new Set();
        this.app.tasks.forEach(task => {
            task.tags.forEach(tag => allTags.add(tag));
        });
        
        return Array.from(allTags).sort();
    }
    
    getFilterSummary() {
        const totalTasks = this.app.tasks.length;
        const activeTasks = this.app.tasks.filter(t => !t.completed).length;
        const completedTasks = this.app.tasks.filter(t => t.completed).length;
        const priorityTasks = this.app.tasks.filter(t => t.priority === 'high').length;
        
        return {
            total: totalTasks,
            active: activeTasks,
            completed: completedTasks,
            priority: priorityTasks,
            filtered: this.getFilteredTasks().length
        };
    }
    
    // Advanced filtering methods
    filterByDateRange(startDate, endDate) {
        if (!this.app || !this.app.tasks) return [];
        
        return this.app.tasks.filter(task => {
            if (!task.dueDate) return false;
            
            const taskDate = new Date(task.dueDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            return taskDate >= start && taskDate <= end;
        });
    }
    
    filterByPriority(priority) {
        if (!this.app || !this.app.tasks) return [];
        
        return this.app.tasks.filter(task => task.priority === priority);
    }
    
    filterByTag(tag) {
        if (!this.app || !this.app.tasks) return [];
        
        return this.app.tasks.filter(task => task.tags.includes(tag));
    }
    
    filterByRecurring(recurringType) {
        if (!this.app || !this.app.tasks) return [];
        
        return this.app.tasks.filter(task => task.recurring === recurringType);
    }
    
    // Search suggestions
    getSearchSuggestions(query) {
        if (!this.app || !this.app.tasks) return [];
        
        const suggestions = new Set();
        
        this.app.tasks.forEach(task => {
            // Add task text suggestions
            if (task.text.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(task.text);
            }
            
            // Add tag suggestions
            task.tags.forEach(tag => {
                if (tag.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.add(`#${tag}`);
                }
            });
        });
        
        return Array.from(suggestions).slice(0, 5);
    }
    
    // Export filtered tasks
    exportFilteredTasks() {
        const filteredTasks = this.getFilteredTasks();
        return {
            tasks: filteredTasks,
            filterInfo: {
                currentFilter: this.currentFilter,
                searchQuery: this.searchQuery,
                activeTags: Array.from(this.activeTags),
                totalFiltered: filteredTasks.length,
                totalTasks: this.app.tasks.length
            }
        };
    }
    
    // Reset all filters
    resetFilters() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.activeTags.clear();
        
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Update UI
        this.updateFilterButtons();
        this.updateTagFilterButtons();
        this.hideSearchResults();
        
        // Reapply filters
        this.applyFilters();
    }
    
    // Get popular tags
    getPopularTags(limit = 10) {
        if (!this.app || !this.app.tasks) return [];
        
        const tagCounts = {};
        
        this.app.tasks.forEach(task => {
            task.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([tag]) => tag);
    }
    
    // Get tag statistics
    getTagStats() {
        if (!this.app || !this.app.tasks) return {};
        
        const tagStats = {};
        
        this.app.tasks.forEach(task => {
            task.tags.forEach(tag => {
                if (!tagStats[tag]) {
                    tagStats[tag] = {
                        total: 0,
                        completed: 0,
                        active: 0
                    };
                }
                
                tagStats[tag].total++;
                if (task.completed) {
                    tagStats[tag].completed++;
                } else {
                    tagStats[tag].active++;
                }
            });
        });
        
        return tagStats;
    }
}

// Add CSS for search results indicator
const style = document.createElement('style');
style.textContent = `
    .search-results-indicator {
        display: none;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-sm);
    }
    
    .results-count {
        color: var(--text-secondary);
    }
    
    .clear-search {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px;
        border-radius: 50%;
        transition: all var(--transition-fast);
    }
    
    .clear-search:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
    
    .empty-state {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-muted);
    }
    
    .empty-state i {
        font-size: var(--font-size-xxl);
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .empty-state p {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-lg);
    }
    
    .empty-state small {
        font-size: var(--font-size-sm);
        opacity: 0.7;
    }
`;
document.head.appendChild(style);
