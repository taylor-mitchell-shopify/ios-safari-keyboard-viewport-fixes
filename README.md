# iOS Safari Sticky Header Solutions

A collection of various solutions to test for the iOS Safari keyboard/sticky header bug. This repository contains multiple approaches to handle the issue where the virtual keyboard affects sticky positioned elements in iOS Safari.

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sticky-header
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access on your iPhone:**
   - The server will display the network URL (e.g., `http://192.168.1.100:3000`)
   - Open this URL on your iPhone's Safari browser
   - You'll see a list of all available solutions

## How It Works

- The server runs on port 3000 by default (configurable via `PORT` environment variable)
- It serves all subdirectories as static sites
- The homepage displays a directory listing of all solutions
- Each solution folder should contain an `index.html` file
- The server is accessible from any device on the same network

## Testing Solutions

1. Start the server on your computer
2. Open the network URL on your iPhone
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
- And more...

## Requirements

- Node.js (v14 or higher)
- npm
- Devices must be on the same network for testing

## Troubleshooting

- **Can't access from iPhone:** Make sure both devices are on the same WiFi network
- **Port already in use:** Change the port by running `PORT=3001 npm start`
- **Solution not showing:** Ensure the solution folder has an `index.html` file

## Development

To add a new solution:
1. Create a new folder in the root directory
2. Add an `index.html` file with your solution
3. The solution will automatically appear in the directory listing