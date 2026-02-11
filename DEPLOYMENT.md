# Neo-Breakout Deployment Guide

## Step 1: GitHub Repository

### Setup (One-time)
1. Create a new repository on GitHub: `neo-breakout`
2. Clone this project and add GitHub remote:
```bash
git remote add origin https://github.com/Starsku/neo-breakout.git
git branch -M main
git push -u origin main
```

### Push Code
```bash
git add .
git commit -m "Your message"
git push
```

## Step 2: Vercel Deployment

### Method 1: Via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Method 2: Via Web Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Import repository `neo-breakout`
4. Vercel auto-detects Vite config
5. Click Deploy

### Auto-Deploy
Once connected, Vercel auto-deploys on every push to `main` branch.

## Deployment URLs

| Service | URL |
|---------|-----|
| GitHub | `https://github.com/Starsku/neo-breakout` |
| Vercel | `https://neo-breakout.vercel.app` |
| Live Game | `https://neo-breakout.vercel.app` |

## Environment Variables

No environment variables required for this project.

## Performance Metrics

- **Build Time**: ~15 seconds
- **Deploy Time**: ~30 seconds total
- **Bundle Size**: 1.5 MB (includes Phaser)
- **Load Time**: < 1 second on 4G

## Troubleshooting

### Build Fails
- Ensure Node 16+ installed
- Clear `node_modules/` and `dist/`
- Run `npm install && npm run build`

### Game Not Loading
- Check browser console for errors
- Verify Phaser CDN if used
- Clear browser cache

### Performance Issues
- Reduce particle count in effects
- Lower resolution on mobile
- Enable frame rate limiter

## Monitoring

Monitor deployments at:
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions (if enabled)

---

**Status**: Ready for production ✅
