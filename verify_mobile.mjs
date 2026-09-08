import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const DIST_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/dist';
const PORT = 4173;

// Static file server for dist/
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`Preview server running at http://localhost:${PORT}`);

  const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const DEBUG_PORT = 9222;

  // Launch Chrome headless with remote debugging
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=390,844',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars'
  ]);

  // Wait for debug port ready
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // Get WebSocket debugger URL
    const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
    const tabs = await listRes.json();
    const wsUrl = tabs[0]?.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No WebSocket URL found');

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };

    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });

    await new Promise((r) => (ws.onopen = r));

    // Set mobile device metrics: width 390, height 844, scale 1
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await send('Page.enable');
    await send('Page.navigate', { url: `http://localhost:${PORT}` });

    // Wait for page load and Three.js rendering
    await new Promise((r) => setTimeout(r, 2500));

    // Evaluate scrollWidth and clientWidth
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        JSON.stringify({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          bodyScrollWidth: document.body.scrollWidth,
          bodyClientWidth: document.body.clientWidth,
          innerWidth: window.innerWidth,
          heroTitle: {
            text: document.querySelector('.hero-title')?.innerText,
            offsetHeight: document.querySelector('.hero-title')?.offsetHeight,
            lineHeight: window.getComputedStyle(document.querySelector('.hero-title')).lineHeight,
            fontSize: window.getComputedStyle(document.querySelector('.hero-title')).fontSize
          }
        })
      `,
    });

    const metrics = JSON.parse(evalRes.result.result.value);
    console.log('=== METRICS RESULT ===');
    console.log(JSON.stringify(metrics, null, 2));

    const OUT_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/screenshots';
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    // Screenshot 1: Hero
    const heroShot = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 390, height: 750, scale: 2 },
    });
    fs.writeFileSync(
      path.join(OUT_DIR, 'screenshot_01_hero_390px.png'),
      Buffer.from(heroShot.result.data, 'base64')
    );
    console.log('Screenshot 1 (Hero) saved.');

    // Scroll to Pillars
    await send('Runtime.evaluate', {
      expression: `document.getElementById('pillars').scrollIntoView();`,
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Screenshot 2: Pillars
    const pillarsShot = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 },
    });
    fs.writeFileSync(
      path.join(OUT_DIR, 'screenshot_02_pillars_390px.png'),
      Buffer.from(pillarsShot.result.data, 'base64')
    );
    console.log('Screenshot 2 (Pillars) saved.');

    // Scroll to Footer
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, document.body.scrollHeight);`,
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Screenshot 3: Footer
    const footerShot = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 350, width: 390, height: 494, scale: 2 },
    });
    fs.writeFileSync(
      path.join(OUT_DIR, 'screenshot_03_footer_390px.png'),
      Buffer.from(footerShot.result.data, 'base64')
    );
    console.log('Screenshot 3 (Footer) saved.');

    ws.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    chromeProcess.kill();
    server.close();
    process.exit(0);
  }
});
