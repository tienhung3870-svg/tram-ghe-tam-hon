import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';

(async () => {
  // Start vite dev server
  const viteProcess = spawn('npx', ['vite', '--port', '4173'], { stdio: 'ignore' });
  
  // Wait for server to start
  await new Promise(r => setTimeout(r, 3000));

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  
  // Wait a bit for animations
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: path.join(process.cwd(), 'public', 'og.png') });
  
  await browser.close();
  viteProcess.kill();
  console.log('og.png generated.');
})();
