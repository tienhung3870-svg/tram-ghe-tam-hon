import { test, expect } from '@playwright/test';
import { PNG } from 'playwright-core/lib/utilsBundle';

test.describe('Visual Content Inspection', () => {
  test('Kiểm tra các section có nội dung và không trơn màu nền', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    const sections = ['#hero', '#pillars', '#books', '#about', '#contact'];

    for (const id of sections) {
      const el = page.locator(id);
      await expect(el).toBeAttached();
      
      // Scroll to element
      await page.evaluate((secId) => {
        if (secId === '#hero') {
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
        const target = document.querySelector(secId);
        if (target) {
          target.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, id);

      await page.waitForTimeout(1000);

      // Take screenshot of viewport
      const screenshotBuffer = await page.screenshot();
      const png = PNG.sync.read(screenshotBuffer);
      const { width, height, data } = png;

      // Check middle region: 20% to 80% of width and height
      const startX = Math.floor(width * 0.2);
      const endX = Math.floor(width * 0.8);
      const startY = Math.floor(height * 0.2);
      const endY = Math.floor(height * 0.8);

      let totalPixels = 0;
      let diffPixels = 0;

      // Base theme background is var(--navy) #1a1a2e
      const baseBgR = 26;
      const baseBgG = 26;
      const baseBgB = 46;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          totalPixels++;
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Euclidean color distance from background
          const dist = Math.sqrt((r - baseBgR) ** 2 + (g - baseBgG) ** 2 + (b - baseBgB) ** 2);
          if (dist > 15) {
            diffPixels++;
          }
        }
      }

      const diffRatio = diffPixels / totalPixels;
      console.log(`Section ${id}: diffRatio = ${(diffRatio * 100).toFixed(2)}%, bg = rgb(${baseBgR},${baseBgG},${baseBgB})`);

      expect(diffRatio, `Section ${id} có tỉ lệ pixel khác nền là ${(diffRatio * 100).toFixed(2)}% (yêu cầu > 5%)`).toBeGreaterThan(0.05);
    }
  });

  test('Kiểm tra .pillar-card innerText khác rỗng khi đang ở trong khung nhìn', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const target = document.querySelector('#pillars');
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await page.waitForTimeout(1000);

    const heading = page.locator('#pillars h2');
    const headingText = await heading.innerText();
    console.log('Pillars heading text:', JSON.stringify(headingText));
    expect(headingText, 'Tiêu đề pillars phải chứa số 3 (AnimatedCounter thành công)').toContain('3');

    const cards = page.locator('.pillar-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).innerText();
      console.log(`Card ${i} text:`, JSON.stringify(text));
      expect(text.trim().length, `Card ${i} có innerText khác rỗng`).toBeGreaterThan(0);
    }
  });

  test('Chụp 5 ảnh 1440 của 5 section', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop_1440') return;

    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    const outDir = '/Users/phamtienhung/.gemini/antigravity/brain/3c3df0e1-bf3d-4a7f-9583-8ec2edf556de';
    const sections = [
      { id: '#hero', file: 'section_01_hero_1440.png' },
      { id: '#pillars', file: 'section_02_pillars_1440.png' },
      { id: '#books', file: 'section_03_books_1440.png' },
      { id: '#about', file: 'section_04_about_1440.png' },
      { id: '#contact', file: 'section_05_contact_1440.png' }
    ];

    for (const sec of sections) {
      await page.evaluate((selector) => {
        if (selector === '#hero') {
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, sec.id);
      await page.waitForTimeout(1200);

      const dest = `${outDir}/${sec.file}`;
      await page.screenshot({ path: dest });
      console.log('Saved screenshot:', dest);
    }
  });
});
