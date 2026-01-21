# Creating PWA Icons from Your Rock Icon

You have the perfect icon design! Here are the easiest ways to create the required PWA icons:

## Quick Method: Online Tool (5 minutes)

1. **Go to**: https://realfavicongenerator.net/
2. **Upload** your original icon image (the rock hand with lightning bolts)
3. **Select**: "Generate Favicons and App Icons"
4. **Choose**: Android Chrome icons
5. **Download** the generated package
6. **Extract** these files:
   - `android-chrome-192x192.png` → rename to `icon-192.png`
   - `android-chrome-512x512.png` → rename to `icon-512.png`
7. **Place both files** in `/public` folder

## Alternative: Use Your Design Tool

If you have the icon in Figma, Photoshop, or similar:

1. **Create a square canvas**:
   - 192x192 pixels for small icon
   - 512x512 pixels for large icon

2. **Set background color**: `#8b5cf6` (your purple theme color)

3. **Center your rock icon** on the background

4. **Export as PNG**:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)

5. **Place both files** in `/public` folder

## Using the SVG Component

If you want to use the RockIcon SVG component:

1. Open `/src/imports/RockIcon.tsx` or `RockIcon-48-634.tsx`
2. Copy the SVG code
3. Use an SVG-to-PNG converter:
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
4. Set size to 192x192 and 512x512
5. Set background to purple (#8b5cf6)
6. Download and save as `icon-192.png` and `icon-512.png`

## Verify Icons

After adding icons, test locally:

```bash
npm run build
npm run preview
```

Then check:
- Browser DevTools → Application → Manifest
- Should show your icons listed
- Icons should display correctly

## File Structure

Your `/public` folder should have:
```
public/
  ├── icon-192.png    ← 192x192 pixels
  ├── icon-512.png    ← 512x512 pixels
  ├── manifest.json
  └── sw.js
```

Once icons are in place, your PWA will be fully functional! 🚀

