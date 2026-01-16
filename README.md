# Forest Encroachment Monitoring Dashboard

An interactive dashboard system for monitoring forest encroachment using satellite imagery and AI-powered remote sensing. This application provides three specialized dashboards for different stakeholders:

- **DFO Dashboard**: For Divisional Forest Officers - comprehensive land-use monitoring and alerts
- **Range Officer Dashboard**: For field operations - detailed alerts with geo-tagged evidence and action items
- **Policymaker Dashboard**: High-level analytics and policy impact assessment

## Features

### DFO Dashboard
- Land-use change detection visualization
- Encroachment statistics by type (Agriculture, Construction, Logging, Mining)
- Geographic visualization with interactive map
- Recent alerts with severity indicators
- Encroachment summary by zone

### Range Officer Dashboard
- Field-level alerts with priority classification
- Geo-tagged visual evidence from satellite imagery
- Task status tracking
- Interactive map with alert locations
- Action items and verification workflow

### Policymaker Dashboard
- 5-year trend analysis
- Regional comparison metrics
- Policy impact assessment
- High-level KPIs and metrics
- Monthly alert trends
- Key insights and recommendations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

- Navigate between dashboards using the navigation bar at the top
- Click on map markers to view alert details
- Interact with charts to explore data
- View evidence and update status in the Range Officer dashboard

## Technologies Used

- React 18
- React Router DOM
- Recharts (for data visualization)
- Leaflet & React-Leaflet (for maps)
- Vite (build tool)

## Project Structure

```
dashboard/
├── src/
│   ├── dashboards/
│   │   ├── DFODashboard.jsx
│   │   ├── RangeOfficerDashboard.jsx
│   │   └── PolicymakerDashboard.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` or `master` branch.

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically detect your repository name and set the correct base path

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Wait for deployment**: The GitHub Actions workflow will build and deploy your site automatically.

### Manual Deployment

If you prefer to deploy manually:

1. **Update the base path** (if needed):
   - If your repository is `username.github.io` (user/org page), the default `base: '/'` is correct
   - If your repository is `username.github.io/repo-name`, update `vite.config.js`:
     ```js
     const base = process.env.BASE_PATH || '/repo-name/'
     ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages**:
   - Go to your repository Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select branch: `gh-pages` (create it if it doesn't exist)
   - Select folder: `/ (root)`
   - Copy the contents of the `dist` folder to the `gh-pages` branch:
     ```bash
     npm run build
     cd dist
     git init
     git add -A
     git commit -m "Deploy to GitHub Pages"
     git push -f git@github.com:username/repo-name.git main:gh-pages
     ```

### Important Notes

- The `404.html` file in the `public` folder is required for client-side routing to work on GitHub Pages. It redirects all 404 errors to `index.html`, allowing React Router to handle the routing.
- All asset paths (images, GeoJSON files) are configured to work with the base path automatically.
- If your site still doesn't work, check the browser console for errors and verify the base path matches your repository structure.

## Note

This is a static dashboard with mock data for demonstration purposes. In a production environment, this would integrate with APIs to fetch real-time satellite imagery data and encroachment detection results.
