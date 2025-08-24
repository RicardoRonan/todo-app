// Dashboard Module - Charts and Statistics using Chart.js
export class Dashboard {
    constructor() {
        this.app = null;
        this.charts = {};
        this.weeklyChart = null;
        this.tagsChart = null;
    }
    
    init(app) {
        this.app = app;
        this.setupCharts();
    }
    
    setupCharts() {
        this.createWeeklyChart();
        this.createTagsChart();
    }
    
    createWeeklyChart() {
        const ctx = document.getElementById('weekly-chart');
        if (!ctx) return;
        
        this.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.getWeekLabels(),
                datasets: [{
                    label: 'Tasks Completed',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(209, 107, 165, 0.8)',
                    borderColor: 'rgba(209, 107, 165, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(209, 107, 165, 1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'var(--font-family-primary)'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'var(--font-family-primary)'
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createTagsChart() {
        const ctx = document.getElementById('tags-chart');
        if (!ctx) return;
        
        this.tagsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(209, 107, 165, 0.8)',
                        'rgba(95, 251, 241, 0.8)',
                        'rgba(255, 107, 107, 0.8)',
                        'rgba(81, 207, 102, 0.8)',
                        'rgba(255, 212, 59, 0.8)',
                        'rgba(186, 131, 202, 0.8)',
                        'rgba(170, 143, 216, 0.8)',
                        'rgba(154, 154, 225, 0.8)'
                    ],
                    borderColor: [
                        'rgba(209, 107, 165, 1)',
                        'rgba(95, 251, 241, 1)',
                        'rgba(255, 107, 107, 1)',
                        'rgba(81, 207, 102, 1)',
                        'rgba(255, 212, 59, 1)',
                        'rgba(186, 131, 202, 1)',
                        'rgba(170, 143, 216, 1)',
                        'rgba(154, 154, 225, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'var(--font-family-primary)',
                                size: 12
                            },
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(209, 107, 165, 1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    updateCharts(tasks) {
        this.updateWeeklyChart(tasks);
        this.updateTagsChart(tasks);
        this.updateStats(tasks);
    }
    
    updateWeeklyChart(tasks) {
        if (!this.weeklyChart) return;
        
        const weeklyData = this.getWeeklyCompletionData(tasks);
        
        this.weeklyChart.data.datasets[0].data = weeklyData;
        this.weeklyChart.update('active');
    }
    
    updateTagsChart(tasks) {
        if (!this.tagsChart) return;
        
        const tagData = this.getTagDistributionData(tasks);
        
        this.tagsChart.data.labels = tagData.labels;
        this.tagsChart.data.datasets[0].data = tagData.data;
        this.tagsChart.update('active');
    }
    
    updateStats(tasks) {
        const stats = this.calculateStats(tasks);
        
        // Update stat cards
        document.getElementById('total-tasks').textContent = stats.total;
        document.getElementById('completed-tasks').textContent = stats.completed;
        
        // Update gamification stats
        const gamificationStats = this.app.gamification.getStats();
        document.getElementById('current-streak').textContent = gamificationStats.streak;
        document.getElementById('current-level').textContent = gamificationStats.level;
        
        // Update XP bar
        const xpProgress = gamificationStats.xpProgress;
        const xpFill = document.getElementById('xp-fill');
        const xpText = document.getElementById('xp-text');
        
        if (xpFill) {
            xpFill.style.width = `${xpProgress.percentage}%`;
        }
        
        if (xpText) {
            xpText.textContent = `${xpProgress.current} / ${xpProgress.needed} XP`;
        }
    }
    
    getWeekLabels() {
        const labels = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            const dayNum = date.getDate();
            labels.push(`${dayName} ${dayNum}`);
        }
        
        return labels;
    }
    
    getWeeklyCompletionData(tasks) {
        const data = [0, 0, 0, 0, 0, 0, 0];
        
        tasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                const today = new Date();
                const diffTime = today - completedDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays <= 6) {
                    data[6 - diffDays]++;
                }
            }
        });
        
        return data;
    }
    
    getTagDistributionData(tasks) {
        const tagCounts = {};
        
        tasks.forEach(task => {
            task.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        // Sort by count and take top 8
        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);
        
        return {
            labels: sortedTags.map(([tag]) => `#${tag}`),
            data: sortedTags.map(([,count]) => count)
        };
    }
    
    calculateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const active = total - completed;
        const priority = tasks.filter(task => task.priority === 'high').length;
        
        return {
            total,
            completed,
            active,
            priority,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
    
    // Advanced analytics methods
    getProductivityTrend() {
        if (!this.app || !this.app.tasks) return [];
        
        const trend = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const completedOnDate = this.app.tasks.filter(task => 
                task.completed && 
                task.completedAt && 
                task.completedAt.startsWith(dateStr)
            ).length;
            
            trend.push({
                date: dateStr,
                completed: completedOnDate
            });
        }
        
        return trend;
    }
    
    getTaskCompletionTime() {
        if (!this.app || !this.app.tasks) return [];
        
        return this.app.tasks
            .filter(task => task.completed && task.createdAt && task.completedAt)
            .map(task => {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                const hours = (completed - created) / (1000 * 60 * 60);
                
                return {
                    task: task.text,
                    hours: hours,
                    days: hours / 24
                };
            })
            .sort((a, b) => a.hours - b.hours);
    }
    
    getMostProductiveTime() {
        if (!this.app || !this.app.tasks) return {};
        
        const hourCounts = {};
        
        this.app.tasks
            .filter(task => task.completed && task.completedAt)
            .forEach(task => {
                const hour = new Date(task.completedAt).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
        
        return hourCounts;
    }
    
    getTaskComplexity() {
        if (!this.app || !this.app.tasks) return {};
        
        const complexity = {
            simple: 0,    // 1-2 words
            medium: 0,    // 3-5 words
            complex: 0    // 6+ words
        };
        
        this.app.tasks.forEach(task => {
            const wordCount = task.text.split(' ').length;
            
            if (wordCount <= 2) {
                complexity.simple++;
            } else if (wordCount <= 5) {
                complexity.medium++;
            } else {
                complexity.complex++;
            }
        });
        
        return complexity;
    }
    
    getPriorityDistribution() {
        if (!this.app || !this.app.tasks) return {};
        
        const distribution = {
            high: 0,
            normal: 0,
            low: 0
        };
        
        this.app.tasks.forEach(task => {
            distribution[task.priority] = (distribution[task.priority] || 0) + 1;
        });
        
        return distribution;
    }
    
    // Export dashboard data
    exportDashboardData() {
        return {
            stats: this.calculateStats(this.app.tasks),
            weeklyData: this.getWeeklyCompletionData(this.app.tasks),
            tagData: this.getTagDistributionData(this.app.tasks),
            productivityTrend: this.getProductivityTrend(),
            completionTime: this.getTaskCompletionTime(),
            productiveTime: this.getMostProductiveTime(),
            complexity: this.getTaskComplexity(),
            priorityDistribution: this.getPriorityDistribution()
        };
    }
    
    // Generate insights
    generateInsights() {
        const insights = [];
        const stats = this.calculateStats(this.app.tasks);
        const completionTime = this.getTaskCompletionTime();
        const productiveTime = this.getMostProductiveTime();
        
        // Completion rate insight
        if (stats.completionRate >= 80) {
            insights.push({
                type: 'success',
                title: 'Excellent Progress!',
                message: `You've completed ${stats.completionRate}% of your tasks. Keep up the great work!`
            });
        } else if (stats.completionRate < 50) {
            insights.push({
                type: 'warning',
                title: 'Room for Improvement',
                message: `Only ${stats.completionRate}% of tasks completed. Consider breaking down larger tasks.`
            });
        }
        
        // Completion time insight
        if (completionTime.length > 0) {
            const avgHours = completionTime.reduce((sum, task) => sum + task.hours, 0) / completionTime.length;
            
            if (avgHours < 24) {
                insights.push({
                    type: 'success',
                    title: 'Quick Task Completion',
                    message: `Tasks are completed in an average of ${Math.round(avgHours)} hours.`
                });
            } else if (avgHours > 168) { // 1 week
                insights.push({
                    type: 'warning',
                    title: 'Long Task Duration',
                    message: `Tasks take an average of ${Math.round(avgHours / 24)} days to complete.`
                });
            }
        }
        
        // Most productive time insight
        if (Object.keys(productiveTime).length > 0) {
            const mostProductiveHour = Object.entries(productiveTime)
                .sort(([,a], [,b]) => b - a)[0];
            
            insights.push({
                type: 'info',
                title: 'Peak Productivity',
                message: `You're most productive at ${mostProductiveHour[0]}:00 with ${mostProductiveHour[1]} tasks completed.`
            });
        }
        
        return insights;
    }
    
    // Refresh all charts
    refresh() {
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
        }
        if (this.tagsChart) {
            this.tagsChart.destroy();
        }
        
        this.setupCharts();
        this.updateCharts(this.app.tasks);
    }
}

// Add CSS for chart responsiveness
const style = document.createElement('style');
style.textContent = `
    .chart-card canvas {
        max-height: 300px;
    }
    
    @media (max-width: 768px) {
        .chart-card canvas {
            max-height: 250px;
        }
    }
`;
document.head.appendChild(style);
