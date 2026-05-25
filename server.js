/**
 * Cổng HTTP LAN (mặc định :8080): luôn mở ứng dụng CDSS (màn đăng nhập), không hiển thị trang trạng thái tím.
 * - Có dist/index.html → phục vụ bản expo export (production / sau desktop:export:light).
 * - Chưa có dist → proxy sang Expo dev (mặc định http://127.0.0.1:8081, chạy `npm run web`).
 */
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = Number(process.env.PORT || 8080);
const EXPO_DEV_ORIGIN = String(process.env.EXPO_DEV_URL || 'http://127.0.0.1:8081').replace(/\/$/, '');
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');
const coWebBuild = fs.existsSync(indexHtml);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function thongBaoChuaSanSang(res, loiProxy) {
  const ip = getLocalIP();
  res.status(503).type('html').send(`<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CDSS BHYT</title></head>
<body style="font-family:Segoe UI,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem;color:#222">
<h1>CDSS BHYT</h1>
<p>Chưa phục vụ được ứng dụng tại cổng ${PORT}.</p>
<ul>
<li><strong>Cách 1 (khuyến nghị):</strong> <code>npm run desktop:export:light</code> rồi <code>npm run start:lan</code></li>
<li><strong>Cách 2 (dev):</strong> Terminal khác: <code>npm run web</code> (port 8081), sau đó tải lại trang này — server sẽ chuyển tiếp sang Expo.</li>
</ul>
${loiProxy ? `<p style="color:#b71c1c">Expo dev (${EXPO_DEV_ORIGIN}): ${loiProxy}</p>` : ''}
<p>Hoặc mở trực tiếp: <a href="${EXPO_DEV_ORIGIN}/">${EXPO_DEV_ORIGIN}/</a></p>
<p>LAN: <code>http://${ip}:${PORT}/</code></p>
</body></html>`);
}

function proxySangExpo(req, res) {
  const target = new URL(req.originalUrl || req.url || '/', `${EXPO_DEV_ORIGIN}/`);
  const headers = { ...req.headers, host: target.host };
  delete headers.connection;

  const proxyReq = http.request(
    {
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    thongBaoChuaSanSang(res, err.message || String(err));
  });

  if (req.method === 'GET' || req.method === 'HEAD') {
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: os.hostname(),
    ip: getLocalIP(),
    port: PORT,
    webBuild: coWebBuild,
    expoDev: EXPO_DEV_ORIGIN,
  });
});

app.use('/api', (req, res) => {
  res.json({
    message: 'Python API thường chạy port 8000',
    docs: `http://${getLocalIP()}:8000/docs`,
  });
});

app.get('/app', (req, res) => res.redirect(301, '/'));

if (coWebBuild) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const p = req.path || '';
    if (
      p.startsWith('/_expo')
      || p.startsWith('/assets')
      || p.startsWith('/tai_lieu')
      || p === '/favicon.ico'
    ) {
      return next();
    }
    if (/\.\w{1,8}$/i.test(p)) return next();
    res.sendFile(indexHtml);
  });
  app.use((req, res) => {
    res.status(404).type('text').send('Không tìm thấy tài nguyên.');
  });
} else {
  app.use((req, res) => proxySangExpo(req, res));
}

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  if (coWebBuild) {
    console.log(`CDSS BHYT — app (dist/) tại http://${ip}:${PORT}/ (màn hình đăng nhập)`);
  } else {
    console.log(`CDSS BHYT — chuyển tiếp ${PORT} → ${EXPO_DEV_ORIGIN} (chạy "npm run web" nếu chưa mở)`);
    console.log(`Hoặc build: npm run desktop:export:light rồi khởi động lại start:lan`);
  }
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
