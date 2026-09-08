import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 4173;
const PREVIEW_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('Starting preview server...');
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: '/Volumes/Transcend/backup_home/tram-ghe-tam-hon',
    stdio: 'pipe',
  });

  // Wait for server ready
  await new Promise((resolve) => {
    previewProcess.stdout.on('data', (d) => {
      if (d.toString().includes(String(PORT))) resolve();
    });
    setTimeout(resolve, 2000);
  });

  console.log('Server is ready. Launching Chrome...');
  const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const DEBUG_PORT = 9222;

  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=390,844',
    '--no-sandbox',
    '--disable-gpu',
    '--force-device-scale-factor=1',
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
    const tabs = await listRes.json();
    const tab = tabs[0];
    if (!tab?.webSocketDebuggerUrl) throw new Error('No debugger URL');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await new Promise((r) => (ws.onopen = r));

    const call = (method, params = {}) =>
      new Promise((res) => {
        const msgId = id++;
        pending.set(msgId, res);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });

    await call('Page.enable');
    await call('DOM.enable');
    await call('CSS.enable');

    // Emulate iPhone 12/13/14: 390x844
    await call('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      fitWindow: false,
    });

    await call('Page.navigate', { url: PREVIEW_URL });

    // Wait for network idle and canvas rendering
    await new Promise((r) => setTimeout(r, 3000));

    // Get exact scrollWidth, clientWidth, and H1 details
    const res = await call('Runtime.evaluate', {
      expression: `
        (() => {
          const doc = document.documentElement;
          const body = document.body;
          const h1 = document.querySelector('.hero-title');
          const h1Style = window.getComputedStyle(h1);
          
          return JSON.stringify({
            docScrollWidth: doc.scrollWidth,
            docClientWidth: doc.clientWidth,
            bodyScrollWidth: body.scrollWidth,
            bodyClientWidth: body.clientWidth,
            windowInnerWidth: window.innerWidth,
            isEqual: doc.scrollWidth === doc.clientWidth,
            h1: {
              text: h1.innerText,
              fontSize: h1Style.fontSize,
              lineHeight: h1Style.lineHeight,
              offsetHeight: h1.offsetHeight,
              clientHeight: h1.clientHeight,
              rect: h1.getBoundingClientRect()
            }
          });
        })()
      `,
    });

    const data = JSON.parse(res.result.result.value);
    console.log('=== VERIFICATION DATA ===');
    console.log(JSON.stringify(data, null, 2));

    const OUT_DIR = '/Volumes/Transcend/backup_home/tram-ghe-tam-hon/screenshots';
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    // 1. Screenshot Hero (Viewport 390x844)
    const heroShot = await call('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 },
    });
    fs.writeFileSync(
      path.join(OUT_DIR, '01_hero_390px.png'),
      Buffer.from(heroShot.result.data, 'base64')
    );
    console.log('Saved 01_hero_390px.png');

    // 2. Screenshot 3 Pillars
    await call('Runtime.evaluate', {
      expression: `document.getElementById('pillars').scrollIntoView({ behavior: 'instant' });`,
    });
    await new Promise((r) => setTimeout(r, 1000));

    const pillarShot = await call('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 },
    });
    fs.writeFileSync(
      path.join(OUT_DIR, '02_pillars_390px.png'),
      Buffer.from(pillarShot.result.data, 'base64')
    );
    console.log('Saved 02_pillars_390px.png');

    // 3. Screenshot Footer
    await call('Runtime.evaluate', {
      expression: `window.scrollTo(0, document.body.scrollHeight);`,
    });
    await new Promise((r) => setTimeout(r, 1000));

    const footerShot = await call('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 200, width: 390, height: 644, scale: 2 },
    });
    fs.writeFileSync(
      path.join(OUT_DIR, '03_footer_390px.png'),
      Buffer.from(footerShot.result.data, 'base64')
    );
    console.log('Saved 03_footer_390px.png');

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
    previewProcess.kill();
    process.exit(0);
  }
}

main();
