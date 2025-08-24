# Deployment Guide for Pixel Task Master

## Pre-Deployment Checklist

Before pushing your project, ensure you have:

1. **Fixed manifest paths** - Updated to use relative paths (`./` instead of `/`)
2. **Fixed service worker cache paths** - Updated to use relative paths
3. **Placeholder icons** - Created placeholder files (replace with actual PNG icons)
4. **Removed screenshots** - Removed from manifest (optional: add actual screenshots later)

## Deployment Options

### GitHub Pages
1. Push your code to GitHub
2. Go to Settings > Pages
3. Select source branch (usually `main` or `master`)
4. Your app will be available at: `https://yourusername.github.io/repository-name/`

### Netlify
1. Connect your GitHub repository to Netlify
2. Build command: (leave empty - static site)
3. Publish directory: `.` (root)
4. Your app will be available at: `https://your-app-name.netlify.app`

### Vercel
1. Connect your GitHub repository to Vercel
2. Framework preset: Other
3. Build command: (leave empty)
4. Output directory: `.` (root)
5. Your app will be available at: `https://your-app-name.vercel.app`

## Post-Deployment Tasks

### 1. Replace Placeholder Icons
Replace the placeholder icon files with actual PNG images:
- `public/icons/icon-192.png` (192x192 pixels)
- `public/icons/icon-512.png` (512x512 pixels)

### 2. Test PWA Installation
1. Open your deployed app in Chrome/Edge
2. Check if the install button appears
3. Test offline functionality
4. Verify service worker registration

### 3. Optional: Add Screenshots
If you want to add screenshots to your PWA manifest:
1. Create a `public/screenshots/` directory
2. Add screenshots of your app in different themes
3. Update `manifest.webmanifest` to include the screenshots

## Common Issues & Solutions

### Issue: PWA not installing
**Solution:** Check that:
- HTTPS is enabled (required for PWA)
- Icons are valid PNG files
- Manifest is properly formatted

### Issue: Service worker not caching
**Solution:** Check browser console for errors and verify:
- All file paths in service worker are correct
- Files exist at the specified paths

### Issue: App not working offline
**Solution:** Verify:
- Service worker is registered successfully
- All required files are in the cache list
- No JavaScript errors preventing app initialization

## Testing Checklist

- [ ] App loads without errors
- [ ] Tasks can be added and completed
- [ ] Drag and drop works
- [ ] Themes switch correctly
- [ ] Dashboard displays data
- [ ] PWA installs successfully
- [ ] Works offline
- [ ] Data persists between sessions
- [ ] Sound effects work (if enabled)
- [ ] Export/import functions work

## Useful Links

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
