// Storage Module - Handles data persistence with LocalStorage and IndexedDB fallback
export class TaskStorage {
    constructor() {
        this.dbName = 'PixelTaskMasterDB';
        this.dbVersion = 1;
        this.storeName = 'tasks';
        this.db = null;
        this.useIndexedDB = false;
    }
    
    async init() {
        try {
            // Try to use IndexedDB first
            if ('indexedDB' in window) {
                await this.initIndexedDB();
                this.useIndexedDB = true;
            } else {
                console.log('IndexedDB not supported, using LocalStorage');
            }
        } catch (error) {
            console.log('IndexedDB failed, falling back to LocalStorage:', error);
        }
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create tasks store
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('completed', 'completed', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
                
                // Create gamification store
                if (!db.objectStoreNames.contains('gamification')) {
                    db.createObjectStore('gamification', { keyPath: 'id' });
                }
            };
        });
    }
    
    async getTasks() {
        if (this.useIndexedDB && this.db) {
            return this.getTasksFromIndexedDB();
        } else {
            return this.getTasksFromLocalStorage();
        }
    }
    
    async saveTasks(tasks) {
        if (this.useIndexedDB && this.db) {
            await this.saveTasksToIndexedDB(tasks);
        } else {
            this.saveTasksToLocalStorage(tasks);
        }
    }
    
    async getTasksFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || []);
        });
    }
    
    async saveTasksToIndexedDB(tasks) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Clear existing data
            const clearRequest = store.clear();
            clearRequest.onerror = () => reject(clearRequest.error);
            
            clearRequest.onsuccess = () => {
                // Add new tasks
                let completed = 0;
                let total = tasks.length;
                
                if (total === 0) {
                    resolve();
                    return;
                }
                
                tasks.forEach(task => {
                    const addRequest = store.add(task);
                    addRequest.onerror = () => reject(addRequest.error);
                    addRequest.onsuccess = () => {
                        completed++;
                        if (completed === total) {
                            resolve();
                        }
                    };
                });
            };
        });
    }
    
    getTasksFromLocalStorage() {
        try {
            const tasks = localStorage.getItem('pixel-task-master-tasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error reading from LocalStorage:', error);
            return [];
        }
    }
    
    saveTasksToLocalStorage(tasks) {
        try {
            localStorage.setItem('pixel-task-master-tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving to LocalStorage:', error);
            // Try to save with reduced data if quota exceeded
            this.handleStorageQuotaExceeded(tasks);
        }
    }
    
    handleStorageQuotaExceeded(tasks) {
        try {
            // Remove completed tasks older than 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const filteredTasks = tasks.filter(task => {
                if (!task.completed) return true;
                if (!task.completedAt) return true;
                return new Date(task.completedAt) > thirtyDaysAgo;
            });
            
            localStorage.setItem('pixel-task-master-tasks', JSON.stringify(filteredTasks));
            console.log('Storage quota exceeded, removed old completed tasks');
        } catch (error) {
            console.error('Failed to handle storage quota exceeded:', error);
        }
    }
    
    async getGamificationData() {
        if (this.useIndexedDB && this.db) {
            return this.getGamificationFromIndexedDB();
        } else {
            return this.getGamificationFromLocalStorage();
        }
    }
    
    async saveGamificationData(data) {
        if (this.useIndexedDB && this.db) {
            await this.saveGamificationToIndexedDB(data);
        } else {
            this.saveGamificationToLocalStorage(data);
        }
    }
    
    async getGamificationFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gamification'], 'readonly');
            const store = transaction.objectStore('gamification');
            const request = store.get('stats');
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || this.getDefaultGamificationData());
        });
    }
    
    async saveGamificationToIndexedDB(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gamification'], 'readwrite');
            const store = transaction.objectStore('gamification');
            const request = store.put({ id: 'stats', ...data });
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    
    getGamificationFromLocalStorage() {
        try {
            const data = localStorage.getItem('pixel-task-master-gamification');
            return data ? JSON.parse(data) : this.getDefaultGamificationData();
        } catch (error) {
            console.error('Error reading gamification from LocalStorage:', error);
            return this.getDefaultGamificationData();
        }
    }
    
    saveGamificationToLocalStorage(data) {
        try {
            localStorage.setItem('pixel-task-master-gamification', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving gamification to LocalStorage:', error);
        }
    }
    
    getDefaultGamificationData() {
        return {
            xp: 0,
            level: 1,
            streak: 0,
            lastCompletedDate: null,
            badges: [],
            totalTasksCompleted: 0,
            weeklyStats: this.getEmptyWeeklyStats()
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
    
    async clearAllData() {
        if (this.useIndexedDB && this.db) {
            await this.clearIndexedDB();
        } else {
            this.clearLocalStorage();
        }
    }
    
    async clearIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName, 'gamification'], 'readwrite');
            
            // Clear tasks
            const tasksStore = transaction.objectStore(this.storeName);
            const tasksRequest = tasksStore.clear();
            
            // Clear gamification
            const gamificationStore = transaction.objectStore('gamification');
            const gamificationRequest = gamificationStore.clear();
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
    
    clearLocalStorage() {
        try {
            localStorage.removeItem('pixel-task-master-tasks');
            localStorage.removeItem('pixel-task-master-gamification');
        } catch (error) {
            console.error('Error clearing LocalStorage:', error);
        }
    }
    
    async exportData() {
        const tasks = await this.getTasks();
        const gamification = await this.getGamificationData();
        
        return {
            tasks,
            gamification,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }
    
    async importData(data) {
        if (data.tasks && Array.isArray(data.tasks)) {
            await this.saveTasks(data.tasks);
        }
        
        if (data.gamification) {
            await this.saveGamificationData(data.gamification);
        }
    }
    
    // Utility method to check storage availability
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Get storage usage information
    getStorageInfo() {
        if (this.useIndexedDB) {
            return {
                type: 'IndexedDB',
                name: this.dbName,
                version: this.dbVersion
            };
        } else {
            return {
                type: 'LocalStorage',
                available: this.checkStorageAvailability()
            };
        }
    }
}
