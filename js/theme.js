// Theme Module - Light, Dark, and CRT Theme Management
export class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                name: 'Light',
                icon: 'fas fa-sun',
                description: 'Clean and bright interface'
            },
            dark: {
                name: 'Dark',
                icon: 'fas fa-moon',
                description: 'Easy on the eyes'
            },
            crt: {
                name: 'Retro CRT',
                icon: 'fas fa-tv',
                description: 'Nostalgic green terminal look'
            }
        };
    }
    
    init() {
        this.loadSavedTheme();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
    }
    
    setupEventListeners() {
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.cycleTheme();
            });
        }
        
        // Theme radio buttons in settings
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        });
        
        // System theme preference
        this.setupSystemThemeListener();
    }
    
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'system') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('pixel-task-master-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        } else {
            // Default to system preference or light theme
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            } else {
                this.currentTheme = 'light';
            }
        }
    }
    
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found`);
            return;
        }
        
        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.saveTheme();
        this.updateUI();
    }
    
    cycleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextTheme = themeNames[nextIndex];
        
        this.setTheme(nextTheme);
    }
    
    applyTheme(themeName) {
        const root = document.documentElement;
        
        // Remove all theme classes
        root.classList.remove('theme-light', 'theme-dark', 'theme-crt');
        
        // Add current theme class
        root.classList.add(`theme-${themeName}`);
        
        // Set data attribute for CSS custom properties
        root.setAttribute('data-theme', themeName);
        
        // Apply CRT-specific effects
        if (themeName === 'crt') {
            this.applyCRTEffects();
        } else {
            this.removeCRTEffects();
        }
        
        // Update theme toggle icon
        this.updateThemeToggleIcon();
        
        // Update radio buttons in settings
        this.updateThemeRadioButtons(themeName);
    }
    
    applyCRTEffects() {
        // Add CRT scanlines overlay
        const crtOverlay = document.getElementById('crt-overlay');
        if (crtOverlay) {
            crtOverlay.style.display = 'block';
        }
        
        // Add CRT-specific animations
        this.addCRTAnimations();
        
        // Add CRT font effects
        document.body.style.fontFamily = 'monospace';
        document.body.style.letterSpacing = '0.5px';
    }
    
    removeCRTEffects() {
        // Remove CRT scanlines overlay
        const crtOverlay = document.getElementById('crt-overlay');
        if (crtOverlay) {
            crtOverlay.style.display = 'none';
        }
        
        // Remove CRT-specific animations
        this.removeCRTAnimations();
        
        // Restore normal font
        document.body.style.fontFamily = '';
        document.body.style.letterSpacing = '';
    }
    
    addCRTAnimations() {
        // Add flicker effect
        const flickerKeyframes = `
            @keyframes crt-flicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.98; }
            }
        `;
        
        // Add scanline effect
        const scanlineKeyframes = `
            @keyframes crt-scanline {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100vh); }
            }
        `;
        
        // Add glow effect
        const glowKeyframes = `
            @keyframes crt-glow {
                0%, 100% { text-shadow: 0 0 5px #00ff00; }
                50% { text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00; }
            }
        `;
        
        this.addKeyframes([flickerKeyframes, scanlineKeyframes, glowKeyframes]);
        
        // Apply animations to elements
        document.body.style.animation = 'crt-flicker 0.15s infinite';
        
        // Add scanline element
        if (!document.getElementById('crt-scanline')) {
            const scanline = document.createElement('div');
            scanline.id = 'crt-scanline';
            scanline.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(to bottom, transparent, #00ff00, transparent);
                animation: crt-scanline 3s linear infinite;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(scanline);
        }
        
        // Add glow to text elements
        document.querySelectorAll('h1, h2, h3, .task-text').forEach(element => {
            element.style.animation = 'crt-glow 2s ease-in-out infinite';
        });
    }
    
    removeCRTAnimations() {
        // Remove flicker from body
        document.body.style.animation = '';
        
        // Remove scanline element
        const scanline = document.getElementById('crt-scanline');
        if (scanline) {
            scanline.remove();
        }
        
        // Remove glow from text elements
        document.querySelectorAll('h1, h2, h3, .task-text').forEach(element => {
            element.style.animation = '';
        });
        
        // Remove keyframes
        this.removeKeyframes();
    }
    
    addKeyframes(keyframes) {
        const styleId = 'crt-keyframes';
        let style = document.getElementById(styleId);
        
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        style.textContent = keyframes.join('\n');
    }
    
    removeKeyframes() {
        const style = document.getElementById('crt-keyframes');
        if (style) {
            style.remove();
        }
    }
    
    updateThemeToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const theme = this.themes[this.currentTheme];
            themeToggle.innerHTML = `<i class="${theme.icon}"></i>`;
            themeToggle.title = `Switch to ${theme.name} theme`;
        }
    }
    
    updateThemeRadioButtons(themeName) {
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.checked = radio.value === themeName;
        });
    }
    
    updateUI() {
        // Update theme toggle button
        this.updateThemeToggleIcon();
        
        // Update radio buttons
        this.updateThemeRadioButtons(this.currentTheme);
        
        // Trigger custom event for other modules
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }
    
    saveTheme() {
        localStorage.setItem('pixel-task-master-theme', this.currentTheme);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getThemeInfo(themeName) {
        return this.themes[themeName] || null;
    }
    
    getAllThemes() {
        return this.themes;
    }
    
    // Preview theme without saving
    previewTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.applyTheme(themeName);
    }
    
    // Revert to saved theme
    revertTheme() {
        this.loadSavedTheme();
        this.applyTheme(this.currentTheme);
    }
    
    // Get theme statistics
    getThemeStats() {
        const savedTheme = localStorage.getItem('pixel-task-master-theme');
        return {
            current: this.currentTheme,
            saved: savedTheme,
            systemPreference: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            available: Object.keys(this.themes)
        };
    }
    
    // Export theme settings
    exportThemeSettings() {
        return {
            currentTheme: this.currentTheme,
            savedTheme: localStorage.getItem('pixel-task-master-theme'),
            timestamp: new Date().toISOString()
        };
    }
    
    // Import theme settings
    importThemeSettings(settings) {
        if (settings.currentTheme && this.themes[settings.currentTheme]) {
            this.setTheme(settings.currentTheme);
        }
    }
    
    // Reset to default theme
    resetTheme() {
        localStorage.removeItem('pixel-task-master-theme');
        this.loadSavedTheme();
        this.applyTheme(this.currentTheme);
    }
}

// Add CSS for theme transitions and CRT effects
const style = document.createElement('style');
style.textContent = `
    /* Theme transitions */
    * {
        transition: background-color var(--transition-normal), 
                    color var(--transition-normal), 
                    border-color var(--transition-normal);
    }
    
    /* CRT Theme specific styles */
    [data-theme="crt"] {
        --primary-color: #00ff00;
        --secondary-color: #00cc00;
        --accent-color: #00ff00;
        --success-color: #00ff00;
        --warning-color: #ffff00;
        --danger-color: #ff0000;
        
        --bg-primary: #0a0a0a;
        --bg-secondary: #1a1a1a;
        --bg-tertiary: #2a2a2a;
        --text-primary: #00ff00;
        --text-secondary: #00cc00;
        --text-muted: #008800;
        --border-color: #00ff00;
    }
    
    [data-theme="crt"] body {
        background: radial-gradient(circle at center, #0a0a0a 0%, #000000 100%);
    }
    
    [data-theme="crt"] .app-header,
    [data-theme="crt"] .app-nav,
    [data-theme="crt"] .tasks-container,
    [data-theme="crt"] .stat-card,
    [data-theme="crt"] .chart-card,
    [data-theme="crt"] .settings-container {
        border: 1px solid #00ff00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }
    
    [data-theme="crt"] .btn-primary {
        background: #00ff00;
        color: #000000;
        border: 1px solid #00ff00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }
    
    [data-theme="crt"] .btn-primary:hover {
        background: #00cc00;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
    }
    
    [data-theme="crt"] .task-checkbox:checked {
        background: #00ff00;
        border-color: #00ff00;
        box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
    }
    
    [data-theme="crt"] .task-tag {
        background: #00ff00;
        color: #000000;
        border: 1px solid #00ff00;
    }
    
    [data-theme="crt"] .nav-btn.active {
        color: #00ff00;
        border-bottom-color: #00ff00;
        text-shadow: 0 0 5px #00ff00;
    }
    
    [data-theme="crt"] .filter-btn.active {
        background: #00ff00;
        color: #000000;
        border-color: #00ff00;
        box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
    }
    
    /* CRT scanlines overlay */
    .crt-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: var(--z-modal);
        opacity: 0;
        transition: opacity var(--transition-normal);
        background: 
            repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 0, 0.03) 2px,
                rgba(0, 255, 0, 0.03) 4px
            ),
            radial-gradient(
                circle at 50% 50%,
                transparent 0%,
                rgba(0, 0, 0, 0.1) 100%
            );
    }
    
    [data-theme="crt"] .crt-overlay {
        opacity: 1;
    }
    
    /* Dark theme specific adjustments */
    [data-theme="dark"] {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2d2d2d;
        --bg-tertiary: #404040;
        --text-primary: #ffffff;
        --text-secondary: #b0b0b0;
        --text-muted: #808080;
        --border-color: #404040;
    }
    
    /* Theme toggle button animations */
    #theme-toggle {
        transition: transform var(--transition-fast);
    }
    
    #theme-toggle:hover {
        transform: rotate(180deg);
    }
    
    /* Theme preview in settings */
    .theme-preview {
        transition: border-color var(--transition-fast);
    }
    
    .theme-option input:checked + .theme-preview {
        border-color: var(--primary-color);
        box-shadow: 0 0 10px rgba(209, 107, 165, 0.3);
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        * {
            transition: none !important;
            animation: none !important;
        }
        
        #theme-toggle:hover {
            transform: none;
        }
    }
`;
document.head.appendChild(style);
