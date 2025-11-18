// Simple local development server
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  // Remove query string and hash
  let filePath = req.url.split('?')[0].split('#')[0];
  
  // Default to index.html
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }
  
  // Resolve file path
  const fullPath = path.join(__dirname, filePath);
  
  // Security check - ensure file is within project directory
  const resolvedPath = path.resolve(fullPath);
  const projectRoot = path.resolve(__dirname);
  
  if (!resolvedPath.startsWith(projectRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // Read and serve file
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      
      const ext = path.extname(fullPath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Local development server running at:`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log('Press Ctrl+C to stop the server\n');
});

