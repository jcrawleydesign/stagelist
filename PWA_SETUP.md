# Progressive Web App (PWA) Setup

Your StageList app now has Progressive Web App features enabled! This allows users to install your app on their devices and use it offline.

## Features Added

✅ **Web App Manifest** - Makes your app installable  
✅ **Service Worker** - Enables offline functionality  
✅ **Install Prompt** - "Install" button appears when app is installable  
✅ **Offline Caching** - App works offline after first visit  
✅ **App-like Experience** - Standalone display mode  

## What Users Can Do

1. **Install the App**
   - On mobile: Browser will show "Add to Home Screen" prompt
   - On desktop: "Install" button appears in footer
   - App opens in standalone window (no browser UI)

2. **Use Offline**
   - After first visit, app caches resources
   - Can view and edit stage lists offline
   - Changes sync to cloud when connection restored

3. **Faster Loading**
   - Cached assets load instantly
   - Reduced data usage

## Setup Steps

### 1. Create App Icons

You need to add two icon files to `/public`:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

**Quick Option**: Use an online tool:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use your existing RockIcon and export it at these sizes.

### 2. Test Locally

```bash
npm run build
npm run preview
```

Visit the preview URL and check:
- Service Worker is registered (check DevTools → Application → Service Workers)
- Manifest is loaded (check DevTools → Application → Manifest)
- Install prompt appears (if criteria met)

### 3. Deploy

Once icons are added, commit and push:

```bash
git add public/
git commit -m "Add PWA icons"
git push
```

Vercel will automatically deploy with PWA features enabled.

## Testing PWA Features

### Chrome/Edge Desktop
1. Visit your deployed app
2. Look for install icon in address bar
3. Or use "Install" button in footer
4. App opens in standalone window

### Mobile (iOS Safari)
1. Visit your app
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon appears on home screen

### Mobile (Android Chrome)
1. Visit your app
2. Browser shows "Add to Home Screen" banner
3. Or use menu → "Install app"
4. App icon appears on home screen

## Service Worker Details

The service worker (`/public/sw.js`) provides:
- **Caching Strategy**: Cache-first for static assets, network-first for API calls
- **Offline Support**: App shell cached for offline access
- **Auto Updates**: Checks for updates every hour
- **Smart Caching**: Excludes Supabase API calls (always uses network)

## Customization

### Update App Name/Description
Edit `/public/manifest.json`:
- `name`: Full app name
- `short_name`: Short name for home screen
- `description`: App description
- `theme_color`: App theme color (currently purple)

### Update Service Worker Cache
Edit `/public/sw.js`:
- `CACHE_NAME`: Change version to force cache refresh
- `PRECACHE_ASSETS`: Add files to cache on install

### Customize Install Prompt
Edit `/src/hooks/usePWAInstall.ts` to customize install button behavior.

## Troubleshooting

### Icons Not Showing
- Ensure icons are in `/public` folder
- Check file names match manifest.json exactly
- Verify icons are PNG format

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (required for service workers)
- Clear browser cache and reload

### Install Button Not Appearing
- App must meet PWA criteria (HTTPS, manifest, service worker)
- User must not have already installed
- Browser must support PWA install

### Offline Not Working
- Visit app at least once while online
- Check Service Worker is active (DevTools → Application)
- Verify cache is populated

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)

