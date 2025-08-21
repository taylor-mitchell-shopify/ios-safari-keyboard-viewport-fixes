const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const EXCLUDED_DIRS = ['node_modules', '.git', '.DS_Store'];
const EXCLUDED_FILES = ['server.js', 'package.json', 'package-lock.json', 'README.md', '.gitignore'];

function findIndexHtml(dirPath) {
  // Check for index.html in root
  if (fs.existsSync(path.join(dirPath, 'index.html'))) {
    return 'index.html';
  }
  // Check for dist/index.html (React/Vite builds)
  if (fs.existsSync(path.join(dirPath, 'dist', 'index.html'))) {
    return 'dist/index.html';
  }
  // Check for build/index.html (Create React App)
  if (fs.existsSync(path.join(dirPath, 'build', 'index.html'))) {
    return 'build/index.html';
  }
  return null;
}

function generateDirectoryListing() {
  const solutionsDir = path.join(__dirname, 'solutions');
  
  if (!fs.existsSync(solutionsDir)) {
    return '<h1>No solutions directory found</h1>';
  }
  
  const items = fs.readdirSync(solutionsDir, { withFileTypes: true });
  
  const solutions = items
    .filter(item => {
      if (EXCLUDED_DIRS.includes(item.name)) return false;
      if (EXCLUDED_FILES.includes(item.name)) return false;
      if (item.name.startsWith('.')) return false;
      return item.isDirectory();
    })
    .map(item => {
      const indexPath = findIndexHtml(path.join(solutionsDir, item.name));
      return {
        name: item.name,
        path: `/solutions/${item.name}${indexPath && indexPath !== 'index.html' ? '/' + path.dirname(indexPath) : ''}`,
        hasIndex: !!indexPath
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iOS Safari Sticky Header Solutions</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      background: #f5f5f7;
    }
    h1 {
      color: #1d1d1f;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      color: #6e6e73;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .solutions {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .solution {
      display: block;
      padding: 16px 20px;
      color: #1d1d1f;
      text-decoration: none;
      border-bottom: 1px solid #e5e5e7;
      transition: background-color 0.2s;
      position: relative;
    }
    .solution:hover {
      background-color: #f5f5f7;
    }
    .solution:last-child {
      border-bottom: none;
    }
    .solution-name {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    .solution-path {
      font-size: 12px;
      color: #6e6e73;
    }
    .no-index {
      opacity: 0.5;
      pointer-events: none;
    }
    .no-index::after {
      content: "(no index.html)";
      margin-left: 8px;
      color: #ff3b30;
      font-size: 12px;
    }
    .info {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #856404;
    }
    .network-info {
      background: white;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .network-info strong {
      color: #007aff;
    }
  </style>
</head>
<body>
  <h1>iOS Safari Sticky Header Solutions</h1>
  <p class="subtitle">Test various solutions for the iOS Safari keyboard/sticky header bug</p>
  
  <div class="network-info">
    📱 Access from your iPhone at: <strong>http://${getNetworkAddress()}:${PORT}</strong>
  </div>
  
  <div class="info">
    💡 Click on any solution below to test it on your iOS device
  </div>
  
  <div class="solutions">
    ${solutions.map(solution => `
      <a href="${solution.path}" class="solution ${!solution.hasIndex ? 'no-index' : ''}">
        <div class="solution-name">${solution.name.replace(/-/g, ' ').replace(/_/g, ' ')}</div>
        <div class="solution-path">${solution.path}</div>
      </a>
    `).join('')}
  </div>
</body>
</html>
  `;
  
  return html;
}

app.get('/', (req, res) => {
  const html = generateDirectoryListing();
  res.send(html);
});

// Serve static files from solutions directory
app.use('/solutions', express.static(path.join(__dirname, 'solutions'), {
  index: false, // We'll handle index files manually
  dotfiles: 'ignore',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle directory requests for solutions
app.use('/solutions/:solution*', (req, res, next) => {
  const solutionName = req.params.solution;
  const subPath = req.params[0] || '';
  const solutionDir = path.join(__dirname, 'solutions', solutionName);
  const requestPath = path.join(solutionDir, subPath);
  
  if (fs.existsSync(requestPath) && fs.statSync(requestPath).isDirectory()) {
    // Look for index.html in various locations
    const indexPath = findIndexHtml(requestPath);
    if (indexPath) {
      res.sendFile(path.join(requestPath, indexPath));
    } else if (subPath === '') {
      // If we're at the solution root and no index found, check parent directory
      const parentIndex = findIndexHtml(solutionDir);
      if (parentIndex) {
        res.sendFile(path.join(solutionDir, parentIndex));
      } else {
        res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>No index.html found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
              padding: 20px;
              text-align: center;
              background: #f5f5f7;
            }
            .error {
              background: white;
              border-radius: 12px;
              padding: 40px;
              max-width: 500px;
              margin: 50px auto;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #ff3b30; }
            p { color: #6e6e73; margin: 20px 0; }
            a {
              color: #007aff;
              text-decoration: none;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>No index.html found</h1>
            <p>This directory doesn't contain an index.html file</p>
            <a href="/">← Back to solutions list</a>
          </div>
        </body>
        </html>
      `);
      }
    } else {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>No index.html found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
              padding: 20px;
              text-align: center;
              background: #f5f5f7;
            }
            .error {
              background: white;
              border-radius: 12px;
              padding: 40px;
              max-width: 500px;
              margin: 50px auto;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #ff3b30; }
            p { color: #6e6e73; margin: 20px 0; }
            a {
              color: #007aff;
              text-decoration: none;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>No index.html found</h1>
            <p>This directory doesn't contain an index.html file</p>
            <a href="/">← Back to solutions list</a>
          </div>
        </body>
        </html>
      `);
    }
  } else {
    next();
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const networkAddress = getNetworkAddress();
  console.log('\n🚀 Server is running!\n');
  console.log(`📍 Local:    http://localhost:${PORT}`);
  console.log(`📱 Network:  http://${networkAddress}:${PORT}`);
  console.log('\n💡 Open the network URL on your iPhone to test the solutions\n');
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});