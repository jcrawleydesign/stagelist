# PWA Icons Required

To complete the PWA setup, you need to create two icon files:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## How to Create Icons

### Option 1: Use an Online Tool
- Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
- Upload your logo/icon
- Generate PWA icons
- Download and place in `/public` folder

### Option 2: Create Manually
- Use your design tool (Figma, Photoshop, etc.)
- Create square icons with your app logo/branding
- Export as PNG:
  - 192x192px → `icon-192.png`
  - 512x512px → `icon-512.png`
- Place both files in the `/public` folder

### Option 3: Use the Rock Icon
If you want to use the existing RockIcon from your app:
1. Export the RockIcon component as SVG
2. Convert to PNG at the required sizes
3. Place in `/public` folder

## Icon Requirements
- **Format**: PNG
- **Sizes**: 192x192 and 512x512 pixels
- **Purpose**: Should work as "any maskable" (can be cropped to different shapes)
- **Background**: Transparent or solid color (theme color: #8b5cf6)

Once icons are added, the PWA will be fully functional!

