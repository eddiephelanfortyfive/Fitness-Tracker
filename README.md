# Fitness Tracker

A React-based hybrid training tracker for tracking running, cycling, and weight training over an 8-week program.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   The app will be available at `http://localhost:5173` (or the port shown in the terminal)

## Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` folder.

## Data Persistence

**All your data is automatically saved!** The app uses browser localStorage to save:
- Running data (distance, duration, pace, RPE)
- Cycling data (distance, pace, RPE)
- Weight training data (sets, weights, reps, RPE, notes)

Your data persists across:
- Page refreshes
- Browser sessions
- Device restarts

**Note:** Data is stored locally in your browser. If you clear browser data or use a different browser/device, you'll need to re-enter your data.

## Deploy to GitHub Pages

This app is perfect for GitHub Pages hosting! Here's how to deploy:

### Option 1: Deploy as a Project Page (Recommended)

1. **Update `vite.config.js`:**
   - Uncomment the `base: '/Fitness-Tracker/'` line (replace `Fitness-Tracker` with your repository name)

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Install GitHub Pages deployment tool:**
   ```bash
   npm install --save-dev gh-pages
   ```

4. **Add deploy script to `package.json`:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   ```

6. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Select "gh-pages" branch
   - Your site will be at: `https://yourusername.github.io/Fitness-Tracker/`

### Option 2: Deploy as User/Organization Page

If you want to deploy to `https://yourusername.github.io`:

1. **Keep `vite.config.js` as is** (base commented out)

2. **Build and deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Select "gh-pages" branch
   - Your site will be at: `https://yourusername.github.io`

### Manual Deployment

If you prefer manual deployment:

1. Build: `npm run build`
2. Create a `gh-pages` branch
3. Copy contents of `dist` folder to the root of `gh-pages` branch
4. Push to GitHub
5. Enable GitHub Pages in repository settings

## Features

- **Schedule View**: See your complete 8-week training schedule
- **Running Tracker**: Log runs with distance, duration, pace, and RPE
- **Cycling Tracker**: Track cycling sessions with interval and steady state options
- **Weight Training**: Log weights, reps, RPE, and notes for all exercises (with dynamic set selection)
- **CSV Export**: Export your weekly data to CSV files
- **Auto-Save**: All data automatically saves to browser localStorage

