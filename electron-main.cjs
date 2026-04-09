'use strict';

/**
 * Shell desktop: phục vụ thư mục dist/ (kết quả `npx expo export --platform web`) qua HTTP nội bộ,
 * rồi mở cửa sổ Electron — tránh lỗi đường dẫn tuyệt đối /_expo/... khi mở file:// trực tiếp.
 */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.ico': 'image/x-icon',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return map[ext] || 'application/octet-stream';
}

function createStaticServer() {
  return http.createServer((req, res) => {
    try {
      const u = new URL(req.url || '/', 'http://127.0.0.1');
      let pathname = decodeURIComponent(u.pathname);
      if (pathname === '/' || pathname === '') pathname = '/index.html';

      const candidate = path.normalize(path.join(distDir, pathname));
      const rel = path.relative(distDir, candidate);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        res.writeHead(403);
        res.end();
        return;
      }

      fs.readFile(candidate, (err, data) => {
        if (err) {
          res.writeHead(err.code === 'ENOENT' ? 404 : 500);
          res.end();
          return;
        }
        res.setHeader('Content-Type', contentType(candidate));
        res.writeHead(200);
        res.end(data);
      });
    } catch {
      res.writeHead(400);
      res.end();
    }
  });
}

let mainWindow;
let server;

function start() {
  if (!fs.existsSync(distDir)) {
    // eslint-disable-next-line no-console
    console.error(
      'Không tìm thấy thư mục dist/. Trên máy build, chạy trước: npx expo export --platform web',
    );
    app.quit();
    return;
  }

  server = createStaticServer();
  server.listen(0, '127.0.0.1', () => {
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    const url = `http://127.0.0.1:${port}/`;

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      title: 'CDSS BHYT Phuong Chau',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    mainWindow.loadURL(url);
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
}

app.whenReady().then(start);

app.on('window-all-closed', () => {
  if (server) {
    try {
      server.close();
    } catch {
      // ignore
    }
    server = null;
  }
  app.quit();
});
