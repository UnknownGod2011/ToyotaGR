# 🚀 Netlify Deployment Guide

## Quick Steps:

### 1. Build the Project
```bash
npm run build
```
This will create a `dist` folder with all the production files.

**Build time:** ~2-3 minutes

### 2. Deploy to Netlify

#### Option A: Drag & Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag the entire `dist` folder onto the page
3. Done! Your site is live

#### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: Connect GitHub Repo
1. Push code to GitHub: https://github.com/UnknownGod2011/ToyotaGR
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## Build Configuration

The project uses Vite for building. Configuration is in `vite.config.ts`.

### Build Output:
- **Folder:** `dist/`
- **Size:** ~5-10 MB (including all assets)
- **Files:** HTML, JS, CSS, images, data files

### What Gets Deployed:
- ✅ All React components (compiled to JS)
- ✅ All charts and visualizations
- ✅ Fallback data for charts
- ✅ Race data (CSV files, track maps)
- ✅ All styling (Tailwind CSS compiled)

## Troubleshooting

### Build Fails with "ENOTEMPTY" Error:
```bash
# Clean dist folder first
rm -rf dist
# Or on Windows PowerShell:
Remove-Item -Recurse -Force dist

# Then build
npm run build
```

### Build Takes Too Long:
- Normal build time is 2-3 minutes
- If it hangs, kill the process and try again:
```bash
# Windows
taskkill /F /IM node.exe

# Then rebuild
npm run build
```

### Charts Not Showing After Deployment:
- ✅ Already fixed! Charts now show fallback data
- The fix removed React anti-patterns that prevented rendering

## Post-Deployment

After deployment, your app will:
1. ✅ Show all 9 charts with fallback data
2. ✅ Allow users to upload telemetry
3. ✅ Display track visualizations
4. ✅ Provide race insights and analysis

## Environment Variables

No environment variables needed for basic deployment!

The app works entirely client-side.

## Custom Domain (Optional)

After deployment on Netlify:
1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

## Performance

Expected Lighthouse scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all files are in the `dist` folder
3. Ensure `index.html` is at the root of `dist`
4. Check Netlify deploy logs for build errors
