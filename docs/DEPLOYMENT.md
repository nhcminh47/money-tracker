# Deployment Guide

The Money Tracker app now uses a **Backend-for-Frontend (BFF)** architecture with server-side API routes. This requires server deployment instead of static hosting.

## Architecture Change

**Before**: Static export (could deploy to GitHub Pages, Netlify static, etc.)  
**After**: Server-side rendering with API routes (requires Node.js server)

**Why**: To hide Supabase credentials and database logic from the frontend for better security.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the creators of Next.js and provides zero-config deployment.

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get your production URL: `https://your-app.vercel.app`

**Features**:
- ✅ Auto SSL/HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Free for personal projects

### Option 2: Self-Hosted (Node.js Server)

Deploy on your own server, VPS, or cloud instance.

#### Requirements
- Node.js 18+ installed
- PM2 or similar process manager (recommended)

#### Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Copy files to server**
   Upload these files/folders to your server:
   - `.next/`
   - `public/`
   - `package.json`
   - `package-lock.json`
   - `next.config.mjs`

3. **Install dependencies on server**
   ```bash
   npm install --production
   ```

4. **Set environment variables**
   Create `.env.production.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   
   Or with PM2 (recommended for production):
   ```bash
   pm2 start npm --name "money-tracker" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable HTTPS** (Let's Encrypt)
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: Docker

Deploy using Docker containers.

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   # Builder
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   # Runner
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Create .dockerignore**
   ```
   node_modules
   .next
   .git
   ```

3. **Build and run**
   ```bash
   docker build -t money-tracker .
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your-url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
     -e SUPABASE_SERVICE_ROLE_KEY=your-service-key \
     money-tracker
   ```

### Option 4: Other Platforms

- **Netlify**: Not recommended (limited serverless function support)
- **Railway**: ✅ Good option, similar to Vercel
- **Render**: ✅ Good option, auto-deploy from Git
- **AWS Amplify**: ✅ Works but more complex setup
- **Google Cloud Run**: ✅ Container-based deployment
- **Azure App Service**: ✅ Works with Node.js

## Environment Variables

All deployment methods require these environment variables:

| Variable | Where to Get | Purpose |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | Your project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role | Server-only admin key |

⚠️ **IMPORTANT**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to git! It has admin access to your database.

## Testing Deployment

After deployment, test these endpoints:

1. **Health check**: Visit your domain
2. **Auth**: Try logging in at `/auth/login`
3. **API**: Check browser console for API calls to `/api/*`
4. **Data sync**: Create data on one device, verify it appears on another

## Troubleshooting

### API routes return 404
- Verify `output: "export"` is removed from `next.config.mjs`
- Check server logs for errors
- Ensure environment variables are set

### "Missing Supabase environment variables"
- Check all three env vars are set in deployment platform
- Restart the server after adding env vars

### Data not syncing
- Check browser console for API errors
- Verify Supabase URL and keys are correct
- Check Supabase logs for authentication issues

### PWA not working
- Ensure HTTPS is enabled (required for PWA)
- Check service worker registration in browser dev tools
- Clear cache and re-register service worker

## Performance Optimization

### For Vercel/Production

1. **Enable caching**
   - API routes automatically cached when possible
   - Static assets cached on CDN

2. **Add revalidation** (if needed)
   ```typescript
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

3. **Monitor performance**
   - Use Vercel Analytics
   - Check API response times
   - Monitor Supabase query performance

## Migration from Static Export

If you previously deployed as static site:

1. **Remove from static host** (GitHub Pages, Netlify static)
2. **Deploy to server platform** (Vercel, Railway, self-hosted)
3. **Update DNS** to point to new deployment
4. **Test thoroughly** before switching DNS

## Cost Estimates

- **Vercel Free**: 0-100GB bandwidth, unlimited personal projects
- **Vercel Pro**: $20/month, 1TB bandwidth
- **Self-hosted VPS**: $5-20/month (DigitalOcean, Linode)
- **Railway**: $5/month minimum
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth

## Next Steps

After successful deployment:
- [ ] Set up custom domain
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring and error tracking
- [ ] Configure automatic backups (Supabase)
- [ ] Test offline functionality
- [ ] Test multi-device sync
