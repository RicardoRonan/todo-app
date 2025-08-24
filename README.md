# Pixel Task Master

A retro-futuristic to-do app with gamification, drag & drop, and smart features. Built with vanilla HTML, CSS, and JavaScript.

![Pixel Task Master](https://img.shields.io/badge/Version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

## Features

### Core Functionality
- **Drag & Drop Reordering** - Intuitive task management
- **Natural Language Quick Add** - "Pay rent tomorrow #bills !!"
- **Smart Tags & Filters** - Organize tasks with #tags
- **Priority Levels** - High, normal, low priority tasks
- **Due Dates** - Set deadlines with natural language
- **Recurring Tasks** - Daily, weekly, monthly tasks

### Gamification
- **XP System** - Earn experience points for completing tasks
- **Level Progression** - Level up as you complete more tasks
- **Streak Tracking** - Maintain daily completion streaks
- **Badges** - Unlock achievements for milestones
- **Sound Effects** - Audio feedback for actions
- **Confetti Celebrations** - Visual rewards for completions

### Dashboard & Analytics
- **Real-time Statistics** - Task completion rates and trends
- **Weekly Charts** - Visualize your productivity
- **Tag Distribution** - See your task categories
- **Productivity Insights** - AI-powered recommendations
- **Export Data** - JSON and CSV export options

### Themes & Customization
- **Light Theme** - Clean and bright interface
- **Dark Theme** - Easy on the eyes
- **Retro CRT Theme** - Nostalgic green terminal look
- **Responsive Design** - Works on all devices
- **Accessibility** - Keyboard navigation and screen reader support

### Advanced Features
- **Offline Support** - Works without internet connection
- **PWA Installation** - Install as a native app
- **Data Persistence** - LocalStorage and IndexedDB
- **Import/Export** - Backup and restore your data
- **Search & Filter** - Find tasks quickly
- **Keyboard Shortcuts** - Power user features

## Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools required!

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheDevRicardo/pixel-task-master.git
   cd pixel-task-master
   ```

2. **Open in browser**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Start using!**
   - Add tasks with natural language: "Buy groceries today #shopping"
   - Drag tasks to reorder them
   - Complete tasks to earn XP and level up
   - Explore the dashboard for insights

## PWA Installation

1. Open the app in Chrome/Edge
2. Click the install button in the address bar
3. Or use the install button in the app header
4. Enjoy the native app experience!

## How to Use

### Adding Tasks
Use natural language to add tasks with metadata:

```
"Pay rent tomorrow #bills !!"     // High priority, due tomorrow
"Buy groceries today #shopping"   // Due today
"Call mom this weekend #personal" // Due this weekend
"Exercise daily #health"          // Recurring daily task
"Team meeting every Monday #work" // Recurring weekly task
```

### Task Management
- **Click checkbox** to complete tasks
- **Drag tasks** to reorder them
- **Click task text** to edit
- **Use filters** to view specific tasks
- **Search** to find tasks quickly

### Gamification
- **Complete tasks** to earn XP
- **Maintain streaks** for bonus rewards
- **Unlock badges** for achievements
- **Level up** to unlock new features

### Dashboard
- **View statistics** on task completion
- **Analyze trends** with charts
- **Track productivity** over time
- **Export data** for backup

## Technical Details

### Architecture
- **Modular JavaScript** - ES6 modules for maintainability
- **CSS Custom Properties** - Dynamic theming system
- **Progressive Enhancement** - Works without JavaScript
- **Service Worker** - Offline functionality and caching

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Storage
- **LocalStorage** - Fallback for older browsers
- **IndexedDB** - Primary storage for modern browsers
- **Automatic migration** between storage types

### Performance
- **Lazy loading** of non-critical resources
- **Efficient caching** strategy
- **Minimal dependencies** - Only Chart.js for charts
- **Optimized animations** with reduced motion support

## 📁 Project Structure

```
pixel-task-master/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Main stylesheet with themes
├── js/
│   ├── app.js             # Main application logic
│   ├── storage.js         # Data persistence layer
│   ├── gamify.js          # Gamification system
│   ├── quickadd.js        # Natural language parsing
│   ├── filters.js         # Search and filtering
│   ├── dashboard.js       # Charts and analytics
│   └── theme.js           # Theme management
├── public/
│   ├── manifest.webmanifest  # PWA manifest
│   ├── service-worker.js     # Service worker
│   ├── icons/                # App icons
│   └── sfx/                  # Sound effects
└── font/
    └── PatrickHand-Regular.ttf  # Custom font
```

## Customization

### Adding New Themes
1. Add theme definition in `js/theme.js`
2. Add CSS variables in `css/style.css`
3. Update theme preview in settings

### Adding New Badges
1. Define badge in `js/gamify.js`
2. Add icon and description
3. Set XP reward amount

### Customizing Colors
Edit CSS custom properties in `css/style.css`:

```css
:root {
  --primary-color: #dc143c;
  --secondary-color: #5ffbf1;
  /* ... more colors */
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure accessibility compliance
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **The Dev Ricardo** - Original concept and design
- **Font Awesome** - Icons
- **Chart.js** - Data visualization
- **Google Fonts** - Typography
- **Patrick Hand** - Custom font

## Support

- **Issues**: [GitHub Issues](https://github.com/TheDevRicardo/pixel-task-master/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TheDevRicardo/pixel-task-master/discussions)
- **Email**: [Contact The Dev Ricardo](mailto:contact@thedevricardo.com)

## Roadmap

### Version 1.1
- [ ] Collaborative task lists
- [ ] Advanced recurring patterns
- [ ] Task templates
- [ ] Mobile app (React Native)

### Version 1.2
- [ ] Cloud sync
- [ ] Team features
- [ ] Advanced analytics
- [ ] API for integrations

### Version 2.0
- [ ] AI-powered task suggestions
- [ ] Voice input
- [ ] Calendar integration
- [ ] Time tracking

---

**Made with love by The Dev Ricardo**

*Transform your productivity with the power of gamification!*
