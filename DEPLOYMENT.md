# Deployment Guide

This guide covers deploying the StageList web app to various hosting platforms.

## Prerequisites

- Node.js (version specified in package.json)
- pnpm package manager
- A Supabase project (already configured in `utils/supabase/info.tsx`)

## Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm dev
   ```

3. **Build for production:**
   ```bash
   pnpm build
   ```

4. **Preview production build locally:**
   ```bash
   pnpm preview
   ```

## Environment Variables

Currently, Supabase credentials are hardcoded in `utils/supabase/info.tsx`. For production deployments, consider refactoring to use environment variables.

If you refactor to use environment variables, create a `.env` file with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

See `.env.example` for reference.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent support for Vite applications with automatic deployments, HTTPS, and global CDN.

#### Steps:

1. **Install Vercel CLI (optional):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub/GitLab/Bitbucket
   - Click "New Project"
   - Import your repository
   - Configure:
     - **Framework Preset:** Vite
     - **Build Command:** `pnpm build`
     - **Output Directory:** `dist`
     - **Install Command:** `pnpm install`
   - Click "Deploy"

3. **Deploy via CLI:**
   ```bash
   vercel
   ```

4. **Environment Variables (if using .env):**
   - Go to Project Settings > Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

The `vercel.json` configuration file is already set up for SPA routing.

### Option 2: Netlify

Netlify offers easy deployment with form handling and serverless functions.

#### Steps:

1. **Install Netlify CLI (optional):**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy via Netlify Dashboard:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub/GitLab/Bitbucket
   - Click "Add new site" > "Import an existing project"
   - Connect your repository
   - Configure:
     - **Build command:** `pnpm build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

3. **Deploy via CLI:**
   ```bash
   netlify deploy --prod
   ```

4. **Environment Variables (if using .env):**
   - Go to Site Settings > Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

The `netlify.toml` configuration file is already set up for SPA routing.

### Option 3: Azure Static Web Apps

Azure Static Web Apps integrates well with Azure services and provides built-in CI/CD.

#### Steps:

1. **Create Azure Static Web App Resource:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new "Static Web App" resource
   - Configure:
     - **Build Presets:** Custom
     - **App location:** `/` (root)
     - **Api location:** Leave empty (no API)
     - **Output location:** `dist`

2. **Connect to GitHub/GitLab:**
   - In Azure Portal, go to your Static Web App
   - Click "Manage deployment token"
   - Copy the deployment token

3. **Deploy via Azure CLI:**
   ```bash
   # Install Azure Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli

   # Build the project
   pnpm build

   # Deploy
   swa deploy dist --deployment-token YOUR_DEPLOYMENT_TOKEN
   ```

4. **Environment Variables (if using .env):**
   - Go to Configuration > Application settings
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

The `staticwebapp.config.json` configuration file is already set up for SPA routing.

### Option 4: GitHub Pages

For free static hosting directly from GitHub.

#### Steps:

1. **Update vite.config.ts:**
   ```typescript
   export default defineConfig({
     // ... existing config
     base: '/your-repo-name/', // Replace with your repository name
   })
   ```

2. **Install gh-pages:**
   ```bash
   pnpm add -D gh-pages
   ```

3. **Add deploy script to package.json:**
   ```json
   "scripts": {
     "deploy": "pnpm build && gh-pages -d dist"
   }
   ```

4. **Deploy:**
   ```bash
   pnpm deploy
   ```

5. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Select source: `gh-pages` branch
   - Save

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test authentication (sign in/sign up)
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify Supabase connection is working
- [ ] Test in different browsers
- [ ] Set up custom domain (optional)
- [ ] Configure HTTPS (usually automatic)

## Troubleshooting

### Build Errors

- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version matches requirements
- Clear cache: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Routing Issues

- Ensure deployment configuration files (`vercel.json`, `netlify.toml`, `staticwebapp.config.json`) are in the project root
- Verify SPA routing is configured (all routes redirect to `index.html`)

### Supabase Connection Issues

- Verify Supabase project is active
- Check CORS settings in Supabase dashboard
- Ensure API keys are correct in `utils/supabase/info.tsx`

### Environment Variables Not Working

- Remember: Vite requires `VITE_` prefix for environment variables
- Restart dev server after adding environment variables
- In production, set environment variables in hosting platform dashboard

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)

