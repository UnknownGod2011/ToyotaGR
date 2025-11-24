# Deployment Guide

## 🚀 Build & Deploy

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Build Output
- `dist/index.html` - Main HTML file
- `dist/assets/` - Optimized JS and CSS bundles
- Total size: ~1.6 MB (447 KB gzipped)

## 📦 Deployment Options

### Option 1: Static Hosting (Recommended)

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
npm run build
# Push dist folder to gh-pages branch
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t toyota-gr-racing .
docker run -p 80:80 toyota-gr-racing
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## ⚙️ Environment Configuration

### Base URL
If deploying to a subdirectory, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-subdirectory/',
  // ... rest of config
});
```

### Environment Variables
Create `.env.production`:

```env
VITE_API_URL=https://api.your-domain.com
VITE_ANALYTICS_ID=your-analytics-id
```

## 🔧 Performance Optimization

### Code Splitting
The build automatically splits code into chunks. For further optimization:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'charts': ['recharts'],
          'motion': ['framer-motion'],
        },
      },
    },
  },
});
```

### Compression
Enable gzip/brotli compression on your server:

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

**Apache:**
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
</IfModule>
```

## 🌐 CDN Configuration

### CloudFlare
1. Add your domain to CloudFlare
2. Enable Auto Minify (JS, CSS, HTML)
3. Enable Brotli compression
4. Set cache rules for static assets

### Cache Headers
Configure cache headers for optimal performance:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

## 🔒 Security Headers

Add security headers to your server:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;" always;
```

## 📊 Monitoring

### Performance Monitoring
- Use Lighthouse for performance audits
- Monitor Core Web Vitals
- Track 3D rendering performance

### Error Tracking
Integrate error tracking:

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

## 🧪 Pre-Deployment Checklist

- [ ] Run `npm run typecheck` - No TypeScript errors
- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npm run build` - Build succeeds
- [ ] Test production build locally: `npm run preview`
- [ ] Verify 3D scene loads correctly
- [ ] Check all charts render properly
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Verify all animations work smoothly
- [ ] Check console for errors
- [ ] Test with slow 3G network
- [ ] Verify WebGL support detection

## 🌍 Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### WebGL Support
The 3D features require WebGL 2.0 support. Add fallback:

```typescript
// Check WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
  // Show fallback UI
  console.warn('WebGL 2.0 not supported');
}
```

## 📱 Mobile Optimization

### Touch Controls
The 3D scene supports touch gestures:
- Single finger drag: Rotate
- Two finger pinch: Zoom
- Two finger drag: Pan

### Performance
On mobile devices:
- 3D scene may run at 30 FPS
- Particle count is automatically reduced
- Chart animations are optimized

## 🔄 Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📈 Post-Deployment

### Verify Deployment
1. Check all pages load correctly
2. Test 3D visualization
3. Verify charts render
4. Check console for errors
5. Test on different devices
6. Monitor performance metrics

### Analytics
Track key metrics:
- Page load time
- 3D scene initialization time
- Chart render time
- User interactions
- Error rates

## 🆘 Troubleshooting

### Build Fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Update dependencies: `npm update`

### 3D Scene Not Loading
- Check WebGL support
- Verify Three.js loaded correctly
- Check browser console for errors
- Test on different browser

### Performance Issues
- Enable production mode
- Check network tab for large assets
- Verify CDN is working
- Check server response times

## 📞 Support

For deployment issues:
1. Check browser console
2. Review build logs
3. Test locally with `npm run preview`
4. Verify all dependencies installed

---

**Ready to deploy your Toyota GR Racing telemetry system!** 🏁
