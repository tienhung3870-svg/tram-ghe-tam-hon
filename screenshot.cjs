const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });

  const runScreenshots = async (width, height, namePrefix) => {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    // Wait for preloader to finish (assuming it takes ~1.5s max)
    await new Promise(r => setTimeout(r, 2000));

    // Hero 0%
    await page.screenshot({ path: `screenshots/${namePrefix}_hero_0.png` });

    // Hero 50%
    // The hero section pins for 150vh. So scrolling down by 75vh is 50%
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.75));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: `screenshots/${namePrefix}_hero_50.png` });

    // Hero 100%
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.75));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: `screenshots/${namePrefix}_hero_100.png` });

    // Scroll to Books section
    await page.evaluate(() => {
      document.querySelector('#books').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Books 50% (scroll a bit)
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: `screenshots/${namePrefix}_books.png` });

    // Scroll to Marquee
    await page.evaluate(() => {
      document.querySelector('.marquee-container').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: `screenshots/${namePrefix}_marquee.png` });

    await page.close();
  };

  try {
    await runScreenshots(390, 844, 'mobile');
    await runScreenshots(1440, 900, 'desktop');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
