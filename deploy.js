#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const SUBDOMAIN = 'ios-sticky-header-solutions';
const API_URL = 'https://quick.shopify.io/api/sites';
const SOLUTIONS_DIR = path.join(__dirname, 'solutions');

// Excluded items
const EXCLUDED_DIRS = ['node_modules', '.git', '.DS_Store', 'dist', 'build'];
const EXCLUDED_FILES = ['.gitignore', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'eslint.config.js'];

// File collection
const deployFiles = new Map();

function getNetworkAddress() {
  const os = require('os');
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

function findIndexHtml(dirPath) {
  // Check for index.html in root
  if (fs.existsSync(path.join(dirPath, 'index.html'))) {
    return path.join(dirPath, 'index.html');
  }
  // Check for dist/index.html (React/Vite builds)
  if (fs.existsSync(path.join(dirPath, 'dist', 'index.html'))) {
    // Return all files in dist directory
    return path.join(dirPath, 'dist');
  }
  // Check for build/index.html (Create React App)
  if (fs.existsSync(path.join(dirPath, 'build', 'index.html'))) {
    // Return all files in build directory
    return path.join(dirPath, 'build');
  }
  return null;
}

function collectFilesFromDir(dirPath, baseKey) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item.name);
    const fileKey = path.join(baseKey, item.name);
    
    if (item.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(item.name) && !item.name.startsWith('.')) {
        collectFilesFromDir(fullPath, fileKey);
      }
    } else {
      if (!EXCLUDED_FILES.includes(item.name) && !item.name.startsWith('.')) {
        // Only include web files
        const ext = path.extname(item.name).toLowerCase();
        const webExtensions = ['.html', '.css', '.js', '.json', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
        if (webExtensions.includes(ext)) {
          deployFiles.set(fileKey, fullPath);
        }
      }
    }
  });
}

function generateIndexHtml() {
  const solutions = fs.readdirSync(SOLUTIONS_DIR, { withFileTypes: true })
    .filter(item => {
      if (!item.isDirectory()) return false;
      if (EXCLUDED_DIRS.includes(item.name)) return false;
      if (item.name.startsWith('.')) return false;
      return true;
    })
    .map(item => {
      const solutionPath = path.join(SOLUTIONS_DIR, item.name);
      const indexLocation = findIndexHtml(solutionPath);
      let hasIndex = !!indexLocation;
      let indexPath = item.name;
      
      if (indexLocation) {
        if (indexLocation.endsWith('dist')) {
          indexPath = `${item.name}/dist`;
        } else if (indexLocation.endsWith('build')) {
          indexPath = `${item.name}/build`;
        }
      }
      
      return {
        name: item.name,
        path: indexPath,
        hasIndex
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return `<!DOCTYPE html>
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
    .deployment-info {
      background: white;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .deployment-info strong {
      color: #007aff;
    }
  </style>
</head>
<body>
  <h1>iOS Safari Sticky Header Solutions</h1>
  <p class="subtitle">Test various solutions for the iOS Safari keyboard/sticky header bug</p>
  
  <div class="deployment-info">
    📱 Testing on iOS: Open Safari and navigate to this page on your iPhone
  </div>
  
  <div class="info">
    💡 Click on any solution below to test it on your iOS device
  </div>
  
  <div class="solutions">
    ${solutions.map(solution => `
      <a href="${solution.path}/" class="solution ${!solution.hasIndex ? 'no-index' : ''}">
        <div class="solution-name">${solution.name.replace(/-/g, ' ').replace(/_/g, ' ')}</div>
        <div class="solution-path">/${solution.path}/</div>
      </a>
    `).join('')}
  </div>
  
  <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 8px;">
    <h2 style="font-size: 20px; margin-bottom: 10px;">About This Collection</h2>
    <p style="color: #6e6e73; font-size: 14px;">
      This collection contains various approaches to handle the iOS Safari virtual keyboard bug 
      that affects sticky positioned elements. Each solution demonstrates a different technique 
      for managing the viewport and element positioning when the keyboard appears.
    </p>
  </div>
</body>
</html>`;
}

async function collectAllFiles() {
  console.log('📦 Collecting files for deployment...\n');
  
  // Add main index.html
  const indexContent = generateIndexHtml();
  deployFiles.set('index.html', Buffer.from(indexContent));
  console.log('✅ Generated main index.html');
  
  // Process each solution directory
  const solutionDirs = fs.readdirSync(SOLUTIONS_DIR, { withFileTypes: true })
    .filter(item => item.isDirectory() && !EXCLUDED_DIRS.includes(item.name) && !item.name.startsWith('.'));
  
  for (const dir of solutionDirs) {
    const solutionPath = path.join(SOLUTIONS_DIR, dir.name);
    const indexLocation = findIndexHtml(solutionPath);
    
    if (indexLocation) {
      if (indexLocation.endsWith('dist') || indexLocation.endsWith('build')) {
        // Collect all files from build directory
        collectFilesFromDir(indexLocation, dir.name);
        console.log(`✅ Collected build files from ${dir.name}`);
      } else {
        // Collect files from solution root
        const items = fs.readdirSync(solutionPath, { withFileTypes: true });
        items.forEach(item => {
          if (!item.isDirectory()) {
            const ext = path.extname(item.name).toLowerCase();
            const webExtensions = ['.html', '.css', '.js', '.json', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
            if (webExtensions.includes(ext) && !EXCLUDED_FILES.includes(item.name)) {
              deployFiles.set(path.join(dir.name, item.name), path.join(solutionPath, item.name));
            }
          }
        });
        console.log(`✅ Collected files from ${dir.name}`);
      }
    } else {
      console.log(`⚠️  Skipping ${dir.name} (no index.html found)`);
    }
  }
  
  console.log(`\n📊 Total files to deploy: ${deployFiles.size}`);
}

async function deployToQuick() {
  console.log('\n🚀 Deploying to Quick platform...\n');
  console.log(`📍 Target: https://${SUBDOMAIN}.quick.shopify.io\n`);
  
  const form = new FormData();
  
  // Add all collected files to form data
  for (const [webPath, filePath] of deployFiles) {
    if (Buffer.isBuffer(filePath)) {
      // For generated content (like index.html)
      form.append('files', filePath, {
        filename: webPath,
        contentType: 'text/html'
      });
    } else {
      // For actual files
      const fileContent = fs.readFileSync(filePath);
      const mimeType = getMimeType(path.extname(webPath));
      form.append('files', fileContent, {
        filename: webPath,
        contentType: mimeType
      });
    }
  }
  
  try {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const url = new URL(`${API_URL}/${SUBDOMAIN}?force=true`);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: form.getHeaders()
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 200 && result.success) {
              console.log('✅ Deployment successful!');
              console.log(`🌐 Site URL: ${result.url}`);
              console.log(`📁 Files deployed: ${result.filesDeployed}`);
              resolve(result);
            } else {
              console.error('❌ Deployment failed:', result.error || result.message);
              reject(new Error(result.error || result.message));
            }
          } catch (e) {
            console.error('❌ Failed to parse response:', e.message);
            console.error('Response:', data);
            reject(e);
          }
        });
      });
      
      req.on('error', (e) => {
        console.error('❌ Request failed:', e.message);
        reject(e);
      });
      
      form.pipe(req);
    });
  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    throw error;
  }
}

function getMimeType(ext) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

// Main execution
async function main() {
  console.log('🔧 iOS Safari Sticky Header Solutions - Deploy Script\n');
  console.log('================================================\n');
  
  try {
    // Check if solutions directory exists
    if (!fs.existsSync(SOLUTIONS_DIR)) {
      console.error('❌ Solutions directory not found!');
      console.error(`   Expected at: ${SOLUTIONS_DIR}`);
      process.exit(1);
    }
    
    // Collect all files
    await collectAllFiles();
    
    // Deploy to Quick
    await deployToQuick();
    
    console.log('\n✨ Deployment complete!');
    console.log(`\n📱 To test on iOS devices:`);
    console.log(`   1. Open Safari on your iPhone`);
    console.log(`   2. Navigate to: https://${SUBDOMAIN}.quick.shopify.io`);
    console.log(`   3. Test each solution with the virtual keyboard\n`);
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Check if form-data is installed
try {
  require.resolve('form-data');
  main();
} catch(e) {
  console.error('❌ Missing dependency: form-data');
  console.error('   Run: npm install form-data');
  process.exit(1);
}