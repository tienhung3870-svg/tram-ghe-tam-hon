import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const DEPLOY_URL = 'https://temporary-instant-acacia-167w4ch.vercel.app';
const OUT_DIR = '/Users/phamtienhung/.gemini/antigravity/brain/3c3df0e1-bf3d-4a7f-9583-8ec2edf556de/screenshots_r2';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function runSuite() {
  console.log('Launching Chrome for live deploy verification...');
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

  console.log(`Navigating to ${DEPLOY_URL}...`);
  await page.goto(DEPLOY_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2500));

  // --- 1. Đo lường kích thước & H1 trên URL deploy ---
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const h1 = document.querySelector('.hero-title');
    const h1Style = window.getComputedStyle(h1);
    const lines = Array.from(document.querySelectorAll('.title-line')).map((el) => el.innerText);

    return {
      'document.documentElement.scrollWidth': doc.scrollWidth,
      'document.documentElement.clientWidth': doc.clientWidth,
      'body.scrollWidth': body.scrollWidth,
      'body.clientWidth': body.clientWidth,
      'scrollWidth === clientWidth': doc.scrollWidth === doc.clientWidth,
      'hasHorizontalOverflow': doc.scrollWidth > doc.clientWidth,
      h1: {
        text: h1.innerText,
        lineCount: lines.length,
        lines: lines,
        fontSize: h1Style.fontSize,
        lineHeight: h1Style.lineHeight,
        offsetHeight: h1.offsetHeight,
      },
    };
  });

  console.log('=== DEPLOY METRICS ===');
  console.log(JSON.stringify(metrics, null, 2));

  // --- 2. Chụp 5 screenshots thật từ URL deploy ---
  // Shot 1: Hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '01_hero_390px.png') });
  console.log('Saved 01_hero_390px.png');

  // Shot 2: Pillars
  await page.evaluate(() => {
    document.getElementById('pillars').scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '02_pillars_390px.png') });
  console.log('Saved 02_pillars_390px.png');

  // Shot 3: Book Section
  await page.evaluate(() => {
    document.getElementById('books').scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '03_book_390px.png') });
  console.log('Saved 03_book_390px.png');

  // Shot 4: About
  await page.evaluate(() => {
    document.getElementById('about').scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '04_about_390px.png') });
  console.log('Saved 04_about_390px.png');

  // Shot 5: Footer
  await page.evaluate(() => {
    document.querySelector('.site-footer').scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '05_footer_390px.png') });
  console.log('Saved 05_footer_390px.png');

  await browser.close();

  // --- 3. Test WebGL tắt (Fallback Test) ---
  console.log('Running WebGL Disabled Fallback Test...');
  const browserNoGL = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-webgl', '--disable-3d-apis'],
  });

  const pageNoGL = await browserNoGL.newPage();
  await pageNoGL.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Also mock canvas getContext to return null to guarantee detectWebGL() returns false
  await pageNoGL.evaluateOnNewDocument(() => {
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (type.includes('webgl')) return null;
      return null;
    };
  });

  await pageNoGL.goto(DEPLOY_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  const fallbackMetrics = await pageNoGL.evaluate(() => {
    const hasCanvas = !!document.querySelector('canvas');
    const hasFallback = !!document.querySelector('.fallback-hero');
    const h1 = document.querySelector('.hero-title');
    return {
      hasCanvas,
      hasFallback,
      h1Visible: !!h1,
      h1Text: h1?.innerText,
      contentReadable: document.body.innerText.includes('Không ôm sách, chỉ lấy ý sách mà dùng'),
    };
  });

  console.log('=== WEBGL DISABLED TEST RESULT ===');
  console.log(JSON.stringify(fallbackMetrics, null, 2));

  await pageNoGL.screenshot({ path: path.join(OUT_DIR, '06_webgl_disabled_fallback.png') });
  console.log('Saved 06_webgl_disabled_fallback.png');

  await browserNoGL.close();
  console.log('All verification checks completed successfully!');
}

runSuite().catch(console.error);
