import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const DIST_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/dist';
const PORT = 5173;

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
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const h1 = document.querySelector('.hero-title');
    const h1Lines = document.querySelectorAll('.title-line');
    const h1Style = window.getComputedStyle(h1);

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      isOverflowing: doc.scrollWidth > doc.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      windowInnerWidth: window.innerWidth,
      h1: {
        text: h1.innerText,
        lineCount: h1Lines.length,
        lines: Array.from(h1Lines).map((el) => el.innerText),
        fontSize: h1Style.fontSize,
        lineHeight: h1Style.lineHeight,
        offsetHeight: h1.offsetHeight,
      },
    };
  });

  console.log('=== METRICS RESULT ===');
  console.log(JSON.stringify(metrics, null, 2));

  const OUT_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/screenshots';
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. Hero Screenshot (390px)
  await page.screenshot({
    path: path.join(OUT_DIR, '01_hero_390px.png'),
  });
  console.log('Saved 01_hero_390px.png');

  // 2. Pillars Screenshot (390px)
  await page.evaluate(() => {
    document.getElementById('pillars').scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(OUT_DIR, '02_pillars_390px.png'),
  });
  console.log('Saved 02_pillars_390px.png');

  // 3. Footer Screenshot (390px)
  await page.evaluate(() => {
    document.querySelector('.site-footer').scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(OUT_DIR, '03_footer_390px.png'),
  });
  console.log('Saved 03_footer_390px.png');

  await browser.close();
  server.close();
  process.exit(0);
});
