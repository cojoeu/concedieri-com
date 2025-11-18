# Cloudflare Pages Deployment Guide for concedieri.com

## Prerequisites

1. **Cloudflare Account**: You need access to a Cloudflare account with Pages enabled
2. **Domain**: The `concedieri.com` domain should be configured in Cloudflare
3. **API Token**: Generate a Cloudflare API token with Pages edit permissions

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Connect Repository**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** → **Create a project**
   - Connect your Git repository (GitHub/GitLab/Bitbucket)
   - Select the repository containing this project

2. **Configure Build Settings**
   - **Project name**: `concedieri`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `.` (root directory)
   - **Node version**: `18`

3. **Environment Variables** (if needed)
   - No environment variables required for this static site

4. **Custom Domain**
   - After deployment, go to **Custom domains**
   - Add `concedieri.com`
   - Cloudflare will automatically configure DNS records

### Option 2: Deploy via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy . --project-name=concedieri
```

### Option 3: Deploy via GitHub Actions

1. **Set up Secrets in GitHub**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Push to main branch**:
   - The workflow will automatically deploy on push to `main`
   - Or trigger manually via GitHub Actions tab

## Build Process

The build process:
1. Compiles Tailwind CSS (`npm run build:css`)
2. Embeds layoff data into JavaScript (`npm run build:data`)
3. Outputs static files ready for deployment

## Required Files

- `index.html` - Main HTML file
- `css/tailwind.css` - Compiled Tailwind CSS
- `css/styles.css` - Custom styles
- `js/` - All JavaScript files
- `data/layoffs.json` - Data file (embedded in `js/data.js`)
- `_redirects` - Cloudflare Pages redirects file

## Domain Configuration

1. **DNS Setup**:
   - Ensure `concedieri.com` DNS is managed by Cloudflare
   - Add CNAME record: `@` → `concedieri.pages.dev`
   - Or use Cloudflare Pages automatic DNS configuration

2. **SSL/TLS**:
   - Cloudflare automatically provides SSL certificates
   - Ensure SSL/TLS encryption mode is set to "Full" or "Full (strict)"

## Post-Deployment

1. **Verify Deployment**:
   - Visit `https://concedieri.com` to verify the site is live
   - Test all functionality (filters, charts, language toggle)

2. **Performance**:
   - Cloudflare Pages automatically optimizes and caches static assets
   - No additional configuration needed

3. **Updates**:
   - Push changes to `main` branch to trigger automatic deployment
   - Or manually trigger deployment from Cloudflare dashboard

## Troubleshooting

- **Build fails**: Check build logs in Cloudflare dashboard
- **Assets not loading**: Verify `_redirects` file includes proper routes
- **Domain not working**: Check DNS configuration and SSL settings

## Support

For Cloudflare Pages documentation: https://developers.cloudflare.com/pages/

