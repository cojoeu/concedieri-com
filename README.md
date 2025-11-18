# Layoff Tracker

A professional, data-driven website for tracking corporate layoffs with glassmorphism design, charts, and bilingual support (Romanian/English).

## Features

- 🎨 Glassmorphism design with Apple-inspired aesthetics
- 📊 Interactive charts (timeline and company comparisons)
- 🌍 Bilingual support (Romanian/English)
- 🔍 Search and filter functionality
- 📱 Fully responsive design
- 🚀 Optimized for Cloudflare Pages

## Local Development

### Quick Start (with local server - recommended)

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start local server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

### Development with auto-reload

Run Tailwind in watch mode:
```bash
npm run watch
```

Then in another terminal, start the server:
```bash
npm run dev
```

### Alternative: Direct file opening

If you just want to open `index.html` directly (file:// protocol), the embedded data will work, but you'll see a Tailwind CDN warning in the console. This is fine for quick testing, but use the local server for proper development.

## Building for Production

```bash
npm run build
```

This will:
- Build Tailwind CSS to `css/tailwind.css`
- Embed JSON data into `js/data.js` to avoid CORS issues

## Deployment to Cloudflare Pages

### Quick Deploy

```bash
npm run deploy
```

This will build the project and deploy to Cloudflare Pages using Wrangler CLI.

### Manual Deployment

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set build output directory: `.` (root)
5. Deploy!

The `_redirects` file ensures all routes serve `index.html` for SPA routing.

For detailed deployment instructions, see `DEPLOYMENT.md`.

## Project Structure

```
/
├── index.html          # Main HTML file
├── data/
│   └── layoffs.json    # Source data (edit this)
├── css/
│   ├── tailwind.css    # Built Tailwind CSS (generated)
│   └── styles.css      # Custom styles
├── js/
│   ├── data.js         # Embedded JSON data (generated)
│   ├── language.js     # Bilingual functionality
│   ├── charts.js       # Chart rendering
│   └── main.js         # Main application logic
├── src/
│   └── input.css       # Tailwind source
├── scripts/
│   └── embed-data.js   # Data embedding script
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
└── server.js           # Local development server
```

## Adding New Layoff Data

Edit `data/layoffs.json` and run:
```bash
npm run build:data
```

Or run the full build:
```bash
npm run build
```

## Notes

- The embedded data (`js/data.js`) is auto-generated to avoid CORS issues when opening files directly
- In production (Cloudflare Pages), the site will use HTTP/HTTPS and can fetch JSON normally
- The build process creates both the embedded version and keeps the JSON file for flexibility

