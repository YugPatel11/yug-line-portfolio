# 🚀 Deployment Guide — The Yug Line Portfolio

This guide covers everything you need to deploy **The Yug Line** portfolio to production on any hosting platform.

---

## 📋 Quick Specifications

| Property | Value |
| :--- | :--- |
| **Framework** | Astro 5 (Static Site Generator) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node.js Version** | `18.x` or `20.x` (Recommended: `20.x`) |
| **Package Manager** | `npm` |
| **Output Type** | Pure Static HTML, CSS, JS, Assets |

---

## 🛠️ Step 0: Pre-Deployment Local Verification

Before deploying, run these commands in your project folder to ensure everything compiles cleanly:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Build the production bundle
npm run build

# 3. Run the automated audit test
npm test

# 4. (Optional) Preview the production build locally
npm run preview
```

If `npm run build` and `npm test` exit with **success**, your project is 100% ready to deploy.

---

## 🌐 Option 1: Deploy on Vercel (Recommended & Fastest)

Vercel provides automatic deployments on every `git push`, fast global CDN, and free HTTPS.

### Method A: Via Vercel Web Dashboard (Easiest)

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Select your portfolio repository and click **"Import"**.
5. Vercel automatically detects **Astro**:
   - **Framework Preset**: `Astro`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **"Deploy"**.
7. In ~45 seconds, your site is live!

### Method B: Via Vercel CLI (From Terminal)

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Deploy directly from your project directory
vercel

# 3. For production release:
vercel --prod
```

---

## ⚡ Option 2: Deploy on Netlify

Netlify is another top-tier host for Astro static sites.

### Method A: Via Netlify Web Dashboard

1. Push your code to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com) and log in.
3. Click **"Add new site"** → **"Import an existing project"**.
4. Choose **GitHub** and select your portfolio repository.
5. Configure the build settings:
   - **Base directory**: *(Leave blank)*
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**.

### Method B: Via Netlify CLI

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod --dir=dist
```

---

## 🐙 Option 3: Deploy on GitHub Pages

You can host directly on GitHub for free using GitHub Actions.

1. In your repository, create the file `.github/workflows/deploy.yml`:

```yaml
name: Deploy The Yug Line to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Go to your GitHub repository **Settings** → **Pages**:
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push your commit to the `main` branch. GitHub Actions will build and publish your site automatically.

---

## ☁️ Option 4: Deploy on Cloudflare Pages

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**.
2. Click **"Create application"** → **"Pages"** → **"Connect to Git"**.
3. Select your repository.
4. Set build configurations:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **"Save and Deploy"**.

---

## 📁 Option 5: Traditional Web Server (cPanel / VPS / Nginx / Apache / Hostinger)

Because this portfolio builds to pure static HTML/CSS/JS, you can host it on any static web server:

1. Run the build command locally:
   ```bash
   npm run build
   ```
2. Everything you need is now generated inside the **`dist/`** folder.
3. Upload all contents inside the **`dist/`** folder (including `_astro/`, `images/`, `models/`, `index.html`, `404.html`) to your server's public root (`public_html/` or `/var/www/html/`).

### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/portfolio2/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /404.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
}
```

---

## 🏷️ Custom Domain Setup

1. In your host (Vercel, Netlify, Cloudflare), go to **Domain Settings**.
2. Add your custom domain (e.g. `yugrojivadiya.com` or `portfolio.yug.dev`).
3. Add the provided DNS records to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - **A Record**: Point `@` to your host's IP address.
   - **CNAME Record**: Point `www` to `cname.vercel-dns.com` (or Netlify/Cloudflare equivalent).
4. SSL/HTTPS will be automatically provisioned within 15–30 minutes.

---

## 🔍 Post-Deployment Checklist

- [ ] Open the live URL on Desktop and Mobile.
- [ ] Confirm the 3D Metro train model loads smoothly on the Welcome screen.
- [ ] Confirm "Board with Sound" plays audio; "Board Silent" stays 100% quiet.
- [ ] Click "All Stops" and verify interactive station navigation (Stations 00–06).
- [ ] Test the Project Dossier Modals and links to live projects.
- [ ] Verify 404 page by visiting `yourdomain.com/non-existent-page`.
