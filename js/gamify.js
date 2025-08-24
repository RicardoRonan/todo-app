// Gamification Module - XP, Levels, Streaks, Badges, and Sound Effects
export class Gamification {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.streak = 0;
        this.lastCompletedDate = null;
        this.badges = [];
        this.totalTasksCompleted = 0;
        this.weeklyStats = {};
        this.soundEnabled = true;
        this.audioContext = null;
        this.sounds = {};
        this.app = null; // Reference to main app for accessing tasks
        
        // Badge definitions
        this.badgeDefinitions = {
            firstTask: {
                id: 'firstTask',
                name: 'First Steps',
                description: 'Complete your first task',
                icon: 'fas fa-star',
                xpReward: 10
            },
            taskMaster: {
                id: 'taskMaster',
                name: 'Task Master',
                description: 'Complete 10 tasks',
                icon: 'fas fa-crown',
                xpReward: 50
            },
            streak3: {
                id: 'streak3',
                name: 'On Fire',
                description: '3-day streak',
                icon: 'fas fa-fire',
                xpReward: 25
            },
            streak7: {
                id: 'streak7',
                name: 'Week Warrior',
                description: '7-day streak',
                icon: 'fas fa-calendar-week',
                xpReward: 100
            },
            streak30: {
                id: 'streak30',
                name: 'Consistency King',
                description: '30-day streak',
                icon: 'fas fa-calendar-alt',
                xpReward: 500
            },
            level5: {
                id: 'level5',
                name: 'Rising Star',
                description: 'Reach level 5',
                icon: 'fas fa-rocket',
                xpReward: 200
            },
            level10: {
                id: 'level10',
                name: 'Veteran',
                description: 'Reach level 10',
                icon: 'fas fa-medal',
                xpReward: 500
            },
            level20: {
                id: 'level20',
                name: 'Legend',
                description: 'Reach level 20',
                icon: 'fas fa-trophy',
                xpReward: 1000
            },
            perfectDay: {
                id: 'perfectDay',
                name: 'Perfect Day',
                description: 'Complete all tasks in a day',
                icon: 'fas fa-sun',
                xpReward: 75
            },
            earlyBird: {
                id: 'earlyBird',
                name: 'Early Bird',
                description: 'Complete a task before 9 AM',
                icon: 'fas fa-clock',
                xpReward: 30
            },
            nightOwl: {
                id: 'nightOwl',
                name: 'Night Owl',
                description: 'Complete a task after 10 PM',
                icon: 'fas fa-moon',
                xpReward: 30
            },
            weekendWarrior: {
                id: 'weekendWarrior',
                name: 'Weekend Warrior',
                description: 'Complete tasks on weekends',
                icon: 'fas fa-calendar-day',
                xpReward: 40
            }
        };
    }
    
    async init(app = null) {
        this.app = app; // Store reference to main app
        await this.loadStats();
        this.initAudio();
        this.updateUI();
        
        // Check all badges on initialization to ensure none were missed
        setTimeout(() => {
            this.checkAllBadges();
        }, 1000);
        
        // Expose debug methods to window for testing
        window.gamificationDebug = {
            getStats: () => this.getStats(),
            getDebugInfo: () => this.getDebugInfo(),
            checkAllBadges: () => this.checkAllBadges(),
            reset: () => this.reset()
        };
    }
    
    async loadStats() {
        try {
            const savedStats = localStorage.getItem('pixel-task-master-gamification');
            if (savedStats) {
                const stats = JSON.parse(savedStats);
                this.xp = stats.xp || 0;
                this.level = stats.level || 1;
                this.streak = stats.streak || 0;
                this.lastCompletedDate = stats.lastCompletedDate || null;
                this.badges = stats.badges || [];
                this.totalTasksCompleted = stats.totalTasksCompleted || 0;
                this.weeklyStats = stats.weeklyStats || this.getEmptyWeeklyStats();
            }
        } catch (error) {
            console.error('Error loading gamification stats:', error);
        }
    }
    
    async saveStats() {
        try {
            const stats = {
                xp: this.xp,
                level: this.level,
                streak: this.streak,
                lastCompletedDate: this.lastCompletedDate,
                badges: this.badges,
                totalTasksCompleted: this.totalTasksCompleted,
                weeklyStats: this.weeklyStats
            };
            localStorage.setItem('pixel-task-master-gamification', JSON.stringify(stats));
        } catch (error) {
            console.error('Error saving gamification stats:', error);
        }
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
    
    createSounds() {
        // Create simple beep sounds using Web Audio API
        this.sounds = {
            tick: () => this.createBeep(800, 0.1, 0.1),
            level: () => this.createBeep(1200, 0.3, 0.2),
            badge: () => this.createBeep(1000, 0.5, 0.3),
            error: () => this.createBeep(400, 0.2, 0.1)
        };
    }
    
    createBeep(frequency, duration, volume = 0.1) {
        if (!this.audioContext || !this.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('pixel-task-master-sound-enabled', enabled.toString());
    }
    
    addTask(task) {
        // Check for early bird badge
        const hour = new Date().getHours();
        if (hour < 9) {
            this.checkBadge('earlyBird');
        }
        
        // Check for weekend warrior badge
        const day = new Date().getDay();
        if (day === 0 || day === 6) {
            this.checkBadge('weekendWarrior');
        }
    }
    
    completeTask(task) {
        this.totalTasksCompleted++;
        this.addXP(10); // Base XP for completing a task
        
        // Update streak
        this.updateStreak();
        
        // Update weekly stats
        this.updateWeeklyStats();
        
        // Check for badges
        this.checkCompletionBadges();
        
        // Save stats
        this.saveStats();
        
        // Update UI
        this.updateUI();
    }
    
    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.lastCompletedDate ? new Date(this.lastCompletedDate).toDateString() : null;
        
        if (lastDate === today) {
            // Already completed a task today, don't update streak
            return;
        }
        
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (lastDate === yesterday) {
            // Consecutive day
            this.streak++;
        } else if (lastDate && lastDate !== today) {
            // Streak broken (more than 1 day gap)
            this.streak = 1;
        } else {
            // First task ever or first task of the day
            this.streak = 1;
        }
        
        this.lastCompletedDate = new Date().toISOString();
        
        // Check streak badges
        if (this.streak === 3) this.checkBadge('streak3');
        if (this.streak === 7) this.checkBadge('streak7');
        if (this.streak === 30) this.checkBadge('streak30');
    }
    
    updateWeeklyStats() {
        const today = new Date().toISOString().split('T')[0];
        this.weeklyStats[today] = (this.weeklyStats[today] || 0) + 1;
    }
    
    addXP(amount) {
        const oldLevel = this.level;
        this.xp += amount;
        
        // Check for level up
        const newLevel = this.calculateLevel();
        if (newLevel > oldLevel) {
            this.level = newLevel;
            this.playSound('level');
            this.checkLevelBadges();
        }
    }
    
    calculateLevel() {
        // Level formula: level = 1 + sqrt(xp / 100)
        return Math.floor(1 + Math.sqrt(this.xp / 100));
    }
    
    getXPForNextLevel() {
        const nextLevel = this.level + 1;
        return Math.pow(nextLevel - 1, 2) * 100;
    }
    
    getXPProgress() {
        const currentLevelXP = Math.pow(this.level - 1, 2) * 100;
        const nextLevelXP = this.getXPForNextLevel();
        const currentLevelProgress = this.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        
        return {
            current: currentLevelProgress,
            needed: xpNeeded,
            percentage: Math.min(100, (currentLevelProgress / xpNeeded) * 100)
        };
    }
    
    checkCompletionBadges() {
        // Check first task badge
        if (this.totalTasksCompleted === 1) {
            this.checkBadge('firstTask');
        }
        
        // Check task master badge
        if (this.totalTasksCompleted === 10) {
            this.checkBadge('taskMaster');
        }
        
        // Check for perfect day (all tasks completed today)
        const todayTasks = this.getTodayTasks();
        if (todayTasks.length > 0) {
            const todayCompleted = todayTasks.filter(task => task.completed).length;
            if (todayTasks.length === todayCompleted) {
                this.checkBadge('perfectDay');
            }
        }
        
        // Check for night owl (only if completing a task late at night)
        const hour = new Date().getHours();
        if (hour >= 22) {
            this.checkBadge('nightOwl');
        }
    }
    
    checkLevelBadges() {
        if (this.level === 5) this.checkBadge('level5');
        if (this.level === 10) this.checkBadge('level10');
        if (this.level === 20) this.checkBadge('level20');
    }
    
    checkAllBadges() {
        // Check completion badges
        this.checkCompletionBadges();
        
        // Check level badges
        this.checkLevelBadges();
        
        // Check streak badges
        if (this.streak >= 3) this.checkBadge('streak3');
        if (this.streak >= 7) this.checkBadge('streak7');
        if (this.streak >= 30) this.checkBadge('streak30');
        
        // Note: Time-based badges (earlyBird, nightOwl, weekendWarrior) 
        // are checked when tasks are added/completed, not here
    }
    
    checkBadge(badgeId) {
        if (this.badges.includes(badgeId)) {
            return; // Already earned
        }
        
        const badge = this.badgeDefinitions[badgeId];
        if (!badge) {
            console.warn(`Badge definition not found: ${badgeId}`);
            return;
        }
        
        this.badges.push(badgeId);
        this.addXP(badge.xpReward);
        this.playSound('badge');
        
        // Show badge notification
        this.showBadgeNotification(badge);
        
        // Log achievement for debugging
        console.log(`🎉 Achievement unlocked: ${badge.name} - ${badge.description}`);
    }
    
    showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-notification-content">
                <i class="${badge.icon}"></i>
                <div>
                    <h4>${badge.name}</h4>
                    <p>${badge.description}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    getStats() {
        return {
            xp: this.xp,
            level: this.level,
            streak: this.streak,
            totalTasksCompleted: this.totalTasksCompleted,
            badges: this.badges,
            weeklyStats: this.weeklyStats,
            xpProgress: this.getXPProgress()
        };
    }
    
    getDebugInfo() {
        return {
            ...this.getStats(),
            lastCompletedDate: this.lastCompletedDate,
            todayTasks: this.getTodayTasks(),
            badgeDefinitions: Object.keys(this.badgeDefinitions),
            earnedBadges: this.badges,
            unearnedBadges: Object.keys(this.badgeDefinitions).filter(id => !this.badges.includes(id))
        };
    }
    
    getEmptyWeeklyStats() {
        const stats = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            stats[date.toISOString().split('T')[0]] = 0;
        }
        return stats;
    }
    
    updateUI() {
        // Update XP bar
        const xpProgress = this.getXPProgress();
        const xpFill = document.getElementById('xp-fill');
        const xpText = document.getElementById('xp-text');
        
        if (xpFill) {
            xpFill.style.width = `${xpProgress.percentage}%`;
        }
        
        if (xpText) {
            xpText.textContent = `${xpProgress.current} / ${xpProgress.needed} XP`;
        }
        
        // Update level display
        const levelElement = document.getElementById('current-level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
        
        // Update streak display
        const streakElement = document.getElementById('current-streak');
        if (streakElement) {
            streakElement.textContent = this.streak;
        }
        
        // Update badges
        this.renderBadges();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('gamification-updated', {
            detail: this.getStats()
        }));
    }
    
    renderBadges() {
        const badgesGrid = document.getElementById('badges-grid');
        if (!badgesGrid) return;
        
        // Update progress indicator
        const totalBadges = Object.keys(this.badgeDefinitions).length;
        const earnedBadges = this.badges.length;
        const progressPercentage = Math.round((earnedBadges / totalBadges) * 100);
        
        // Find or create progress indicator
        let progressIndicator = document.querySelector('.badges-progress');
        if (!progressIndicator) {
            const badgesSection = badgesGrid.closest('.badges-section');
            const cardBody = badgesSection.querySelector('.card-body');
            const titleElement = cardBody.querySelector('.card-title');
            
            progressIndicator = document.createElement('div');
            progressIndicator.className = 'badges-progress mb-3';
            cardBody.insertBefore(progressIndicator, titleElement.nextSibling.nextSibling);
        }
        
        progressIndicator.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">Progress: ${earnedBadges}/${totalBadges} badges earned</span>
                <span class="text-muted small">${progressPercentage}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-danger" style="width: ${progressPercentage}%"></div>
            </div>
        `;
        
        badgesGrid.innerHTML = '';
        
        Object.values(this.badgeDefinitions).forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = `col-6 col-md-4 col-lg-3 col-xl-2`;
            
            const badgeContent = document.createElement('div');
            badgeContent.className = `badge ${this.badges.includes(badge.id) ? 'earned' : ''}`;
            
            badgeContent.innerHTML = `
                <div class="badge-icon">
                    <i class="${badge.icon}"></i>
                </div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
            `;
            
            badgeElement.appendChild(badgeContent);
            badgesGrid.appendChild(badgeElement);
        });
    }
    
    getTodayTasks() {
        // Get tasks from the main app if available
        if (this.app && this.app.tasks) {
            const today = new Date().toDateString();
            return this.app.tasks.filter(task => {
                // Use createdAt if available, otherwise use current date for backward compatibility
                const taskDate = task.createdAt ? 
                    new Date(task.createdAt).toDateString() : 
                    today;
                return taskDate === today;
            });
        }
        return [];
    }
    
    importStats(stats) {
        this.xp = stats.xp || 0;
        this.level = stats.level || 1;
        this.streak = stats.streak || 0;
        this.lastCompletedDate = stats.lastCompletedDate || null;
        this.badges = stats.badges || [];
        this.totalTasksCompleted = stats.totalTasksCompleted || 0;
        this.weeklyStats = stats.weeklyStats || this.getEmptyWeeklyStats();
        
        this.saveStats();
        this.updateUI();
    }
    
    reset() {
        this.xp = 0;
        this.level = 1;
        this.streak = 0;
        this.lastCompletedDate = null;
        this.badges = [];
        this.totalTasksCompleted = 0;
        this.weeklyStats = this.getEmptyWeeklyStats();
        
        this.saveStats();
        this.updateUI();
    }
}

// Add CSS for badge notifications
const style = document.createElement('style');
style.textContent = `
    .badge-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-primary);
        border: 2px solid #dc143c;
        border-radius: var(--border-radius-md);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-heavy);
        z-index: var(--z-tooltip);
        transform: translateX(100%);
        transition: transform var(--transition-normal);
        max-width: 300px;
    }
    
    .badge-notification.show {
        transform: translateX(0);
    }
    
    .badge-notification-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .badge-notification i {
        font-size: var(--font-size-xl);
        color: #dc143c;
    }
    
    .badge-notification h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: var(--font-size-base);
        font-weight: bold;
    }
    
    .badge-notification p {
        margin: var(--spacing-xs) 0 0 0;
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }
`;
document.head.appendChild(style);
