# iOS Safari Sticky Header Solutions

A collection of various solutions to test for the iOS Safari keyboard/sticky header bug. This repository contains multiple approaches to handle the issue where the virtual keyboard affects sticky positioned elements in iOS Safari.

## Deployment to Quick (Shopify Internal)

### Quick Deployment

The project is structured to be deployed as-is to Shopify's internal Quick platform:

```bash
# Deploy to Quick
npm run deploy

# Force deploy (overwrite without confirmation)
npm run deploy:force
```

**Access the deployed site:**
- URL: https://ios-sticky-header-solutions.quick.shopify.io
- Note: Only accessible to Shopify employees (requires Google auth)

The entire project directory is served statically - no build step required!

## Local Development

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sticky-header
   ```

2. **Run locally (multiple options):**
   ```bash
   # Option 1: Use Express server with network info
   npm install
   npm start
   
   # Option 2: Use npx serve (no install needed)
   npm run serve
   
   # Option 3: Serve on network for mobile testing
   npm run serve:network
   ```

3. **Access on your iPhone:**
   - The server will display the network URL (e.g., `http://192.168.1.100:3000`)
   - Open this URL on your iPhone's Safari browser
   - You'll see a list of all available solutions

## How It Works

- All solutions are in the `solutions/` directory
- The main `index.html` has hardcoded links to each solution
- Everything is served statically - no build step needed
- React apps should have their built files in `dist/` or `build/`
- The entire directory structure is deployed as-is to Quick

## Testing Solutions

1. Access the deployed Quick site or run locally
2. Open on your iPhone's Safari browser
3. Click on any solution from the list
4. Test the behavior with the iOS keyboard
5. Use the back button to return to the solutions list

## Available Solutions

The repository contains various approaches including:
- ChatGPT solutions (multiple approaches)
- iframe decoy solution  
- Visual viewport API solutions
- Meta viewport configurations
- Dynamic viewport units
- React-based prevention hooks
- And more...

## Adding New Solutions

To add a new solution:
1. Create a new folder in `solutions/`
2. Add an `index.html` file with your solution
3. For React/Vite apps, ensure build outputs to `dist/` or `build/`
4. Update the main `index.html` to add a link to your solution
5. Run `./deploy.sh` to deploy

## Requirements

- Node.js (v14 or higher)
- npm
- Quick CLI (for deployment): `npm install -g @shopify/quick`
- For local testing: Devices must be on the same network

## Troubleshooting

- **Can't access from iPhone:** Make sure both devices are on the same WiFi network (local) or use Quick deployment
- **Port already in use:** Change the port by running `PORT=3001 npm start`
- **Solution not showing:** Ensure the solution folder has an `index.html` file
- **Quick deployment fails:** Ensure you're authenticated with Shopify credentials

## Project Structure

```
sticky-header/
├── index.html          # Main page with links to all solutions
├── solutions/          # All solution implementations
│   ├── solution-1/     # Each solution in its own folder
│   │   └── index.html
│   └── solution-2/
│       ├── dist/       # Built files for React/Vite apps
│       └── src/
├── deploy.sh           # Quick deployment script
├── server.js           # Local development server (optional)
└── README.md