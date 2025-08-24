// Quick Add Module - Natural Language Task Parsing
export class QuickAdd {
    constructor() {
        this.app = null;
        this.currentSuggestionIndex = -1;
        this.filteredSuggestions = [];
        this.datePatterns = {
            today: /today|tonight/i,
            tomorrow: /tomorrow/i,
            nextWeek: /next week/i,
            nextMonth: /next month/i,
            specificDate: /(\d{1,2})\/(\d{1,2})|(\d{1,2})-(\d{1,2})/,
            dayOfWeek: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            relativeDays: /in (\d+) days?/i,
            relativeWeeks: /in (\d+) weeks?/i
        };
        
        this.priorityPatterns = {
            high: /!!|urgent|asap|high priority|important/i,
            low: /low priority|not urgent/i
        };
        
        this.recurringPatterns = {
            daily: /daily|every day|each day/i,
            weekly: /weekly|every week|each week/i,
            monthly: /monthly|every month|each month/i,
            yearly: /yearly|every year|each year|annually/i,
            weekdays: /weekdays|week days|monday to friday/i,
            weekends: /weekends|week ends|saturday and sunday/i
        };
    }
    
    init(app) {
        this.app = app;
        this.setupAutocomplete();
    }
    
    parseInput(input) {
        const originalText = input.trim();
        let text = originalText;
        
        // Extract tags
        const tags = this.extractTags(text);
        text = this.removeTags(text);
        
        // Extract priority
        const priority = this.extractPriority(text);
        text = this.removePriority(text);
        
        // Extract due date
        const dueDate = this.extractDueDate(text);
        text = this.removeDatePatterns(text);
        
        // Extract recurring pattern
        const recurring = this.extractRecurring(text);
        text = this.removeRecurring(text);
        
        // Clean up the final text
        text = this.cleanText(text);
        
        return {
            text: text || originalText,
            tags,
            priority,
            dueDate,
            recurring
        };
    }
    
    extractTags(text) {
        const tagPattern = /#(\w+)/g;
        const tags = [];
        let match;
        
        while ((match = tagPattern.exec(text)) !== null) {
            tags.push(match[1].toLowerCase());
        }
        
        return tags;
    }
    
    removeTags(text) {
        return text.replace(/#\w+/g, '').trim();
    }
    
    extractPriority(text) {
        if (this.priorityPatterns.high.test(text)) {
            return 'high';
        }
        if (this.priorityPatterns.low.test(text)) {
            return 'low';
        }
        return 'normal';
    }
    
    removePriority(text) {
        return text
            .replace(/!!/g, '')
            .replace(/urgent|asap|high priority|important/gi, '')
            .replace(/low priority|not urgent/gi, '')
            .trim();
    }
    
    extractDueDate(text) {
        const lowerText = text.toLowerCase();
        
        // Today
        if (this.datePatterns.today.test(lowerText)) {
            return new Date().toISOString().split('T')[0];
        }
        
        // Tomorrow
        if (this.datePatterns.tomorrow.test(lowerText)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }
        
        // Next week
        if (this.datePatterns.nextWeek.test(lowerText)) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek.toISOString().split('T')[0];
        }
        
        // Next month
        if (this.datePatterns.nextMonth.test(lowerText)) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth.toISOString().split('T')[0];
        }
        
        // Specific date (MM/DD or DD-MM)
        const specificDateMatch = lowerText.match(this.datePatterns.specificDate);
        if (specificDateMatch) {
            const month = parseInt(specificDateMatch[1] || specificDateMatch[3]);
            const day = parseInt(specificDateMatch[2] || specificDateMatch[4]);
            const year = new Date().getFullYear();
            
            // Assume current year, but if the date has passed, use next year
            const date = new Date(year, month - 1, day);
            if (date < new Date()) {
                date.setFullYear(year + 1);
            }
            
            return date.toISOString().split('T')[0];
        }
        
        // Day of week
        const dayMatch = lowerText.match(this.datePatterns.dayOfWeek);
        if (dayMatch) {
            const dayName = dayMatch[1].toLowerCase();
            const dayMap = {
                'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
                'friday': 5, 'saturday': 6, 'sunday': 0
            };
            
            const targetDay = dayMap[dayName];
            const today = new Date();
            const currentDay = today.getDay();
            
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) {
                daysToAdd += 7; // Next week
            }
            
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + daysToAdd);
            return targetDate.toISOString().split('T')[0];
        }
        
        // Relative days
        const relativeDaysMatch = lowerText.match(this.datePatterns.relativeDays);
        if (relativeDaysMatch) {
            const days = parseInt(relativeDaysMatch[1]);
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + days);
            return targetDate.toISOString().split('T')[0];
        }
        
        // Relative weeks
        const relativeWeeksMatch = lowerText.match(this.datePatterns.relativeWeeks);
        if (relativeWeeksMatch) {
            const weeks = parseInt(relativeWeeksMatch[1]);
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + (weeks * 7));
            return targetDate.toISOString().split('T')[0];
        }
        
        return null;
    }
    
    removeDatePatterns(text) {
        return text
            .replace(/today|tonight/gi, '')
            .replace(/tomorrow/gi, '')
            .replace(/next week/gi, '')
            .replace(/next month/gi, '')
            .replace(/\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}/g, '')
            .replace(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
            .replace(/in \d+ days?/gi, '')
            .replace(/in \d+ weeks?/gi, '')
            .trim();
    }
    
    extractRecurring(text) {
        const lowerText = text.toLowerCase();
        
        if (this.recurringPatterns.daily.test(lowerText)) {
            return 'daily';
        }
        if (this.recurringPatterns.weekly.test(lowerText)) {
            return 'weekly';
        }
        if (this.recurringPatterns.monthly.test(lowerText)) {
            return 'monthly';
        }
        if (this.recurringPatterns.yearly.test(lowerText)) {
            return 'yearly';
        }
        if (this.recurringPatterns.weekdays.test(lowerText)) {
            return 'weekdays';
        }
        if (this.recurringPatterns.weekends.test(lowerText)) {
            return 'weekends';
        }
        
        return null;
    }
    
    removeRecurring(text) {
        return text
            .replace(/daily|every day|each day/gi, '')
            .replace(/weekly|every week|each week/gi, '')
            .replace(/monthly|every month|each month/gi, '')
            .replace(/yearly|every year|each year|annually/gi, '')
            .replace(/weekdays|week days|monday to friday/gi, '')
            .replace(/weekends|week ends|saturday and sunday/gi, '')
            .trim();
    }
    
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .replace(/^[,\s]+|[,\s]+$/g, '') // Remove leading/trailing commas and spaces
            .replace(/,\s*,/g, ',') // Remove multiple consecutive commas
            .replace(/,\s*$/g, '') // Remove trailing comma
            .trim();
    }
    
    setupAutocomplete() {
        const input = document.getElementById('quick-add-input');
        if (!input) return;
        
        // Add autocomplete suggestions
        const suggestions = [
            'Pay rent tomorrow #bills !!',
            'Buy groceries today #shopping',
            'Call mom this weekend #personal',
            'Finish project by Friday #work !!',
            'Exercise daily #health',
            'Read book next week #learning',
            'Dentist appointment next month #health',
            'Team meeting every Monday #work',
            'Pay bills monthly #finance',
            'Backup files weekly #tech'
        ];
        

        
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            
            if (value.length < 2) {
                this.hideSuggestions();
                return;
            }
            
            this.filteredSuggestions = suggestions.filter(suggestion => 
                suggestion.toLowerCase().includes(value)
            );
            
            if (this.filteredSuggestions.length > 0) {
                this.showSuggestions(this.filteredSuggestions, value);
            } else {
                this.hideSuggestions();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            const suggestionBox = document.getElementById('suggestion-box');
            if (!suggestionBox || suggestionBox.style.display === 'none') return;
            
            const suggestionItems = suggestionBox.querySelectorAll('.suggestion-item');
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.currentSuggestionIndex = Math.min(this.currentSuggestionIndex + 1, suggestionItems.length - 1);
                    this.highlightSuggestion(suggestionItems, this.currentSuggestionIndex);
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.currentSuggestionIndex = Math.max(this.currentSuggestionIndex - 1, -1);
                    this.highlightSuggestion(suggestionItems, this.currentSuggestionIndex);
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (this.currentSuggestionIndex >= 0 && suggestionItems[this.currentSuggestionIndex]) {
                        input.value = suggestionItems[this.currentSuggestionIndex].textContent;
                        this.hideSuggestions();
                        this.app.addTaskFromInput();
                    } else {
                        this.app.addTaskFromInput();
                    }
                    break;
                    
                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !document.getElementById('suggestion-box')?.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }
    
    showSuggestions(suggestions, query) {
        let suggestionBox = document.getElementById('suggestion-box');
        
        if (!suggestionBox) {
            suggestionBox = document.createElement('div');
            suggestionBox.id = 'suggestion-box';
            suggestionBox.className = 'suggestion-box';
            document.body.appendChild(suggestionBox);
        }
        
        const input = document.getElementById('quick-add-input');
        const rect = input.getBoundingClientRect();
        
        suggestionBox.style.position = 'absolute';
        suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionBox.style.left = `${rect.left + window.scrollX}px`;
        suggestionBox.style.width = `${rect.width}px`;
        suggestionBox.style.display = 'block';
        
        suggestionBox.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">${this.highlightMatch(suggestion, query)}</div>
        `).join('');
        
        // Add click handlers
        suggestionBox.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                input.value = suggestions[index];
                this.hideSuggestions();
                this.app.addTaskFromInput();
            });
        });
    }
    
    hideSuggestions() {
        const suggestionBox = document.getElementById('suggestion-box');
        if (suggestionBox) {
            suggestionBox.style.display = 'none';
        }
        this.currentSuggestionIndex = -1;
    }
    
    highlightSuggestion(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('highlighted', i === index);
        });
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Utility method to format date for display
    formatDateForDisplay(dateString) {
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
    
    // Get suggested tags based on common patterns
    getSuggestedTags() {
        return [
            'work', 'personal', 'health', 'finance', 'shopping', 'bills',
            'learning', 'tech', 'family', 'friends', 'urgent', 'important'
        ];
    }
}

// Add CSS for autocomplete suggestions
const style = document.createElement('style');
style.textContent = `
    .suggestion-box {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-medium);
        max-height: 200px;
        overflow-y: auto;
        z-index: var(--z-dropdown);
    }
    
    .suggestion-item {
        padding: var(--spacing-sm) var(--spacing-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        border-bottom: 1px solid var(--border-color);
    }
    
    .suggestion-item:last-child {
        border-bottom: none;
    }
    
    .suggestion-item:hover,
    .suggestion-item.highlighted {
        background: var(--bg-secondary);
    }
    
    .suggestion-item mark {
        background: var(--primary-color);
        color: white;
        padding: 1px 2px;
        border-radius: 2px;
    }
`;
document.head.appendChild(style);
