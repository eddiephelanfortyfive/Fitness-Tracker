# Hybrid Training Tracker

A React-based hybrid training tracker for tracking running, cycling, and weight training over multi-week training programs. Supports Level 1 (8 weeks) and Level 2 (10 weeks) training plans.

## Features

- **Schedule View**: See your complete training schedule with workout status tracking
- **Running Tracker**: Log runs with distance, duration, pace, and RPE. Supports steady runs and interval training
- **Cycling Tracker**: Track cycling sessions with interval and steady state options
- **Weight Training**: Log weights, reps, RPE, and notes for all exercises with dynamic set selection
- **Weight Log**: Track body weight over time with target weight goals
- **Progress Visualization**: 
  - Running distance and pace charts
  - Cycling distance and pace charts
  - Weight training progressive overload charts
  - Body weight trend charts
  - Weekly completion rate tracking
  - Activity timeline
- **Workout Status**: Mark workouts as completed, skipped, or not done
- **CSV Export**: Export your weekly data to CSV files
- **Auto-Save**: All data automatically saves to browser localStorage
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **PWA Support**: Can be installed as a web app on iOS and Android

## Project Structure

The application follows a modular architecture:

```
src/
├── components/          # React components
│   ├── Header.jsx      # Header with level selector
│   ├── Navigation.jsx  # Tab navigation
│   ├── WeekSelector.jsx # Week selector dropdown
│   ├── ScheduleView.jsx # Schedule tab
│   ├── RunningView.jsx # Running tab
│   ├── CyclingView.jsx # Cycling tab
│   ├── WeightsView.jsx # Weights tab
│   ├── WeightLogView.jsx # Weight log tab
│   └── ProgressView.jsx # Progress tab
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.js    # Generic localStorage hook
│   ├── useTrainingData.js    # Running, cycling, weights data
│   ├── useWeightLog.js       # Weight log data
│   ├── useCharts.js          # Chart data memoization
│   └── useProgress.js        # Progress calculations
├── data/               # Data generators and plans
│   ├── defaultData.js  # Default data for Level 1 & 2
│   └── workoutPlans.js # Workout plan structures
├── utils/              # Utility functions
│   ├── calculations.js # Progress calculations
│   ├── export.js       # CSV export
│   └── localStorage.js # localStorage helpers
├── constants/          # Constants
│   └── chartOptions.js # Chart.js configurations
├── App.jsx             # Main orchestrator component
└── main.jsx            # Entry point
```

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
- Running data (distance, duration, pace, RPE, interval structure)
- Cycling data (distance, pace, RPE, segments)
- Weight training data (sets, weights, reps, RPE, notes)
- Weight log entries (body weight tracking)
- Target weight
- Workout status (completed/skipped/not done)
- Active training level (Level 1 or Level 2)

Your data persists across:
- Page refreshes
- Browser sessions
- Device restarts

**Note:** Data is stored locally in your browser. If you clear browser data or use a different browser/device, you'll need to re-enter your data. Data is stored separately for Level 1 and Level 2, so you can switch between levels without losing progress.

## Training Levels

### Level 1 (8 weeks)
- 3 runs per week (Monday, Wednesday, Saturday)
- 1 cycling session per week (Friday)
- 4 weight training days per week (Monday, Tuesday, Wednesday, Thursday)
- Interval runs start at week 6 (Wednesday becomes interval)
- Interval cycling on weeks 2, 4, 6, 8
- Sunday is rest day

### Level 2 (10 weeks)
- 3 runs per week (Monday, Wednesday, Saturday)
- 1 cycling session per week (Thursday)
- 4 weight training days per week (Monday, Tuesday, Thursday, Friday)
- Interval runs start at week 6
- Interval cycling on weeks 2, 4, 6, 8, 10

## Deploy to GitHub Pages

This app is perfect for GitHub Pages hosting! Here's how to deploy:

### Option 1: Deploy as a Project Page (Recommended)

1. **Update `vite.config.js`:**
   - Ensure `base: '/Fitness-Tracker/'` is set (replace `Fitness-Tracker` with your repository name)

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Install GitHub Pages deployment tool:**
   ```bash
   npm install --save-dev gh-pages
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Select "gh-pages" branch
   - Your site will be at: `https://yourusername.github.io/Fitness-Tracker/`

### Option 2: Deploy as User/Organization Page

If you want to deploy to `https://yourusername.github.io`:

1. **Update `vite.config.js`:**
   - Comment out or remove the `base` property

2. **Build and deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Select "gh-pages" branch
   - Your site will be at: `https://yourusername.github.io`

## Installation as PWA (Progressive Web App)

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen with a custom icon

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will be installed as a standalone app

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Lucide React** - Icons
- **localStorage** - Data persistence

## Development

The codebase is organized into modular components and hooks for maintainability:

- **Components**: Reusable UI components for each view
- **Hooks**: Custom hooks for data management and calculations
- **Utils**: Pure functions for calculations and exports
- **Data**: Default data generators and workout plans

## License

This project is open source and available for personal use.
