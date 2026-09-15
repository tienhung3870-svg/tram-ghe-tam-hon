import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DIST_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/dist';
const PORT = 5174;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      isOverflowing: doc.scrollWidth > doc.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      windowInnerWidth: window.innerWidth
    };
  });

  console.log('=== METRICS 1440px RESULT ===');
  console.log(JSON.stringify(metrics, null, 2));

  const OUT_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/screenshots';
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  await page.screenshot({
    path: path.join(OUT_DIR, '01_hero_1440px.png'),
  });
  console.log('Saved 01_hero_1440px.png');

  await browser.close();
  server.close();
  process.exit(0);
});
