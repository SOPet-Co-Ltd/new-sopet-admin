import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('renders Thai login UI and vendor registration link', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    await expect(page.getByLabel('อีเมล')).toBeVisible();
    await expect(page.getByLabel('รหัสผ่าน')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'สมัครเป็นผู้ขาย' })).toBeVisible();
  });

  test('shows forgot-password flow', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();

    await expect(page.getByRole('heading', { name: 'ลืมรหัสผ่าน' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ส่งลิงก์รีเซ็ตรหัสผ่าน' })).toBeVisible();
  });
});
