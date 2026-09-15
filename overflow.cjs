const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });

  const checkOverflow = async (width, height) => {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    const result = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      return { scrollWidth, clientWidth };
    });

    console.log(`[${width}x${height}] scrollWidth: ${result.scrollWidth}, clientWidth: ${result.clientWidth}, match: ${result.scrollWidth === result.clientWidth}`);
    await page.close();
  };

  try {
    await checkOverflow(360, 800);
    await checkOverflow(390, 844);
    await checkOverflow(768, 1024);
    await checkOverflow(1440, 900);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
