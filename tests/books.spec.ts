import { test, expect } from '@playwright/test'

test.describe('Book Routes', () => {
  test('1. /sach/:id (hợp lệ) load được thông tin sách', async ({ page }) => {
    await page.goto('/sach/sapiens')
    await expect(page.locator('h1')).toContainText('Sapiens')
    await expect(page.locator('.book-detail-page')).toBeVisible()
  })

  test('2. /sach/khong-co hiển thị 404 và nút về trang chủ', async ({ page }) => {
    await page.goto('/sach/khong-co')
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('.btn-home')).toBeVisible()
    await expect(page.locator('.btn-home')).toHaveAttribute('href', '/')
  })
})
