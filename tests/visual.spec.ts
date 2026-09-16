import { test, expect } from '@playwright/test';
import { PNG } from 'playwright-core/lib/utilsBundle';

test.describe('Visual Content Inspection', () => {
  test('Kiểm tra các section có nội dung và không trơn màu nền', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

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

  test('Kiểm tra mỗi thẻ sách có <img> bìa sách load thành công (naturalWidth > 0)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const target = document.querySelector('#books');
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await page.waitForTimeout(1000);

    const bookCovers = page.locator('#books .book-cover');
    const count = await bookCovers.count();
    expect(count, 'Phải có ít nhất 2 ảnh bìa sách').toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const img = bookCovers.nth(i);
      await expect(img).toBeVisible();

      // Check alt attribute
      const alt = await img.getAttribute('alt');
      expect(alt, `Ảnh bìa ${i} phải có thuộc tính alt`).toBeTruthy();

      // Check image loaded with naturalWidth > 0
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      console.log(`Book cover ${i} naturalWidth:`, naturalWidth, 'alt:', alt);
      expect(naturalWidth, `Ảnh bìa ${i} load thành công với naturalWidth > 0`).toBeGreaterThan(0);
    }

    const authorStyles = await page.locator('#books .book-author').evaluateAll(els => els.map(el => {
      const cs = window.getComputedStyle(el);
      return { text: el.innerText, color: cs.color, opacity: cs.opacity };
    }));
    console.log('Book author styles:', JSON.stringify(authorStyles));

    // WCAG contrast calculation
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    for (const style of authorStyles) {
      const match = style.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      expect(match).toBeTruthy();
      if (match) {
        const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        const cardBg = [13, 16, 32];
        const l1 = getLuminance(r, g, b);
        const l2 = getLuminance(cardBg[0], cardBg[1], cardBg[2]);
        const contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        console.log(`Tác giả "${style.text}" độ tương phản: ${contrastRatio.toFixed(2)}:1 (yêu cầu >= 4.5:1)`);
        expect(contrastRatio, `Độ tương phản của tên tác giả ${style.text} phải >= 4.5:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('Kiểm tra mỗi .book-card không bị cắt chữ (scrollHeight <= clientHeight) và không tràn lề trái (left >= 0)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Cuộn tới #books
    await page.evaluate(() => {
      const el = document.querySelector('#books');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(500);

    const bookCards = page.locator('#books .book-card');
    const count = await bookCards.count();
    expect(count, 'Phải có ít nhất 2 thẻ sách có class .book-card').toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const card = bookCards.nth(i);
      await expect(card).toBeVisible();
      const metrics = await card.evaluate((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return {
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };
      });
      console.log(`Thẻ sách ${i}:`, metrics);
      expect(
        metrics.scrollHeight,
        `Thẻ ${i} không bị cắt chữ: scrollHeight (${metrics.scrollHeight}) <= clientHeight (${metrics.clientHeight})`
      ).toBeLessThanOrEqual(metrics.clientHeight);
      expect(
        metrics.left,
        `Thẻ ${i} không bị tràn lề trái: left (${metrics.left}) >= 0`
      ).toBeGreaterThanOrEqual(0);
    }

    // Kiểm tra khoảng cách: giữa tiêu đề và thẻ sách, giữa thẻ sách và #about không quá 1/2 màn hình
    const spacing = await page.evaluate(() => {
      const title = document.querySelector('#books h2');
      const firstCard = document.querySelector('#books .book-card');
      const booksSection = document.querySelector('#books');
      const aboutSection = document.querySelector('#about');
      const vh = window.innerHeight;

      const titleBottom = title ? title.getBoundingClientRect().bottom : 0;
      const cardTop = firstCard ? firstCard.getBoundingClientRect().top : 0;
      const cardBottom = firstCard ? firstCard.getBoundingClientRect().bottom : 0;
      const aboutTop = aboutSection ? aboutSection.getBoundingClientRect().top : 0;

      return {
        gapTitleToCard: cardTop - titleBottom,
        gapCardToAbout: aboutTop - cardBottom,
        maxAllowed: vh * 0.5
      };
    });
    console.log('Khoảng trống đo được:', spacing);
    expect(
      spacing.gapTitleToCard,
      `Khoảng trống giữa tiêu đề và thẻ (${spacing.gapTitleToCard}px) không quá 1/2 màn hình (${spacing.maxAllowed}px)`
    ).toBeLessThanOrEqual(spacing.maxAllowed);
    expect(
      spacing.gapCardToAbout,
      `Khoảng trống giữa thẻ sách và #about (${spacing.gapCardToAbout}px) không quá 1/2 màn hình (${spacing.maxAllowed}px)`
    ).toBeLessThanOrEqual(spacing.maxAllowed);
  });

  test('Kiểm tra mỗi h2 trong #books #pillars #about #contact không bị cắt chữ (scrollHeight so với clientHeight lệch không quá 2px)', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    const headingSelectors = [
      { section: '#books', selector: '#books h2' },
      { section: '#pillars', selector: '#pillars h2' },
      { section: '#about', selector: '#about h2' },
      { section: '#contact', selector: '#contact h2' }
    ];

    for (const item of headingSelectors) {
      // Cuộn tới section để kích hoạt animation / kinetic typography
      await page.evaluate((sec) => {
        const el = document.querySelector(sec);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, item.section);
      await page.waitForTimeout(800);

      const h2 = page.locator(item.selector);
      await expect(h2).toBeVisible();

      // Kiểm tra h2: scrollHeight vs clientHeight lệch không quá 2px, không bị overflow:hidden
      const h2Metrics = await h2.evaluate((el: HTMLElement) => {
        const cs = window.getComputedStyle(el);
        return {
          text: el.innerText.trim(),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          diff: Math.abs(el.scrollHeight - el.clientHeight),
          overflow: cs.overflow,
          overflowY: cs.overflowY
        };
      });

      console.log(`Heading ${item.selector}:`, h2Metrics);
      expect(
        h2Metrics.diff,
        `Tiêu đề ${item.selector} ("${h2Metrics.text}"): scrollHeight (${h2Metrics.scrollHeight}) so với clientHeight (${h2Metrics.clientHeight}) lệch không quá 2px (thực tế lệch ${h2Metrics.diff}px)`
      ).toBeLessThanOrEqual(2);
      expect(h2Metrics.overflow, `Tiêu đề ${item.selector} không được có overflow: hidden`).not.toBe('hidden');
      expect(h2Metrics.overflowY, `Tiêu đề ${item.selector} không được có overflow-y: hidden`).not.toBe('hidden');

      // Kiểm tra mọi thẻ con (kể cả span từ useSplitReveal / kinetic typography):
      // Bỏ mọi overflow:hidden đang cắt chữ, scrollHeight không vượt clientHeight quá 2px
      const childSpans = await h2.locator('span').evaluateAll((spans) => {
        return spans.map(s => {
          const cs = window.getComputedStyle(s);
          return {
            text: s.innerText,
            scrollHeight: s.scrollHeight,
            clientHeight: s.clientHeight,
            diff: Math.abs(s.scrollHeight - s.clientHeight),
            overflow: cs.overflow,
            overflowY: cs.overflowY
          };
        });
      });

      for (const sm of childSpans) {
        expect(
          sm.overflow,
          `Khung chữ "${sm.text}" trong ${item.selector} không được có overflow: hidden đang cắt chữ`
        ).not.toBe('hidden');
        expect(
          sm.overflowY,
          `Khung chữ "${sm.text}" trong ${item.selector} không được có overflow-y: hidden đang cắt chữ`
        ).not.toBe('hidden');
        expect(
          sm.diff,
          `Khung chữ "${sm.text}" trong ${item.selector}: scrollHeight (${sm.scrollHeight}) so với clientHeight (${sm.clientHeight}) lệch quá 2px (${sm.diff}px)`
        ).toBeLessThanOrEqual(2);
      }
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
      if (sec.id === '#books') {
        await page.locator('#books').screenshot({ path: dest });
      } else {
        await page.screenshot({ path: dest });
      }
      console.log('Saved screenshot:', dest);
    }

    // Cuộn về đầu trước khi chụp toàn trang desktop 1440
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${outDir}/fullpage_desktop_1440.png`, fullPage: true });
    console.log('Saved fullpage desktop screenshot');
  });

  test('Chụp ảnh full page mobile 390', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile_390') return;
    await page.goto('/');
    await page.locator('.hero-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const outDir = '/Users/phamtienhung/.gemini/antigravity/brain/3c3df0e1-bf3d-4a7f-9583-8ec2edf556de';

    // Cuộn qua từng section để kích hoạt reveal
    for (const sec of ['#hero', '#pillars', '#books', '#about', '#contact']) {
      await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, sec);
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(600);

    await page.screenshot({ path: `${outDir}/fullpage_mobile_390.png`, fullPage: true });
    await page.locator('#books').screenshot({ path: `${outDir}/section_03_books_mobile_390.png` });
    console.log('Saved fullpage mobile 390 screenshot');
  });
});
