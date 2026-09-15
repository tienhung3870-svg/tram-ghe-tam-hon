import { test, expect } from '@playwright/test';

test.describe('Tram Ghe Tam Hon E2E', () => {
  test('1. Trang load không lỗi console', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    // Give it a moment to load and potentially log errors
    await page.waitForTimeout(1000);
    // Note: some network errors for fonts might happen depending on the environment,
    // so let's only fail if there are specific runtime JS errors. But the requirement is no console errors.
    // If it fails on some minor font error, it fulfills the "test can fail" requirement.
    expect(errors).toHaveLength(0);
  });

  test('2. Không tràn ngang ở các viewport', async ({ page, viewport }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBe(clientWidth);
  });

  test('3. Có đủ các section cần thiết', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#pillars')).toBeAttached();
    await expect(page.locator('#books')).toBeAttached();
    await expect(page.locator('#about')).toBeAttached();
    await expect(page.locator('#contact')).toBeAttached();
  });

  test('4. Form email hoạt động đúng', async ({ page }) => {
    await page.goto('/');
    // Route mock for form endpoint
    await page.route('**/form-endpoint-mock', async route => {
      await route.fulfill({ status: 200, json: { success: true } });
    });
    
    // Inject mock endpoint into the page
    await page.evaluate(() => {
      // @ts-ignore
      window.__MOCK_ENDPOINT__ = 'http://localhost:5173/form-endpoint-mock';
    });
    
    // Scroll to contact
    await page.locator('#contact').scrollIntoViewIfNeeded();

    const emailInput = page.locator('.contact-form input[type="email"]');
    const submitBtn = page.locator('.contact-form button[type="submit"]');

    // Sai email
    await emailInput.fill('invalid-email');
    await submitBtn.click();
    await expect(page.locator('.error-text')).toBeVisible();
    await expect(page.locator('.error-text')).toContainText('Email không hợp lệ');

    // Đúng email - Note: because of siteContent.contact.formEndpoint being empty by default in our setup (if no env var),
    // it will simulate success instantly. Let's verify the text changes to success.
    await emailInput.fill('test@example.com');
    await submitBtn.click();
    // It should change to "Đã đăng ký ✓" or show the success message
    await expect(page.locator('.success-text')).toBeVisible();
  });

  test('5. Reduced-motion thì không bị pin hero', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // Check if the GSAP pin-spacer exists
    // The requirement: "kiểm tra không có .pin-spacer quanh hero"
    const pinSpacer = page.locator('.pin-spacer');
    // It might exist for other elements or not at all depending on our code
    // Let's specifically check that the hero section doesn't have it
    const heroPinSpacer = page.locator('.pin-spacer').filter({ has: page.locator('#hero') });
    await expect(heroPinSpacer).toHaveCount(0);
  });
});
