/**
 * Capture UI screenshots for the Thai help center.
 *
 * Usage (admin + backend already running on :3001 / :3002):
 *   yarn help:screenshots
 *   yarn help:screenshots admin
 *   yarn help:screenshots vendor
 *
 * Writes PNGs to public/help/{admin|vendor|shared}/
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE = process.env.HELP_SHOT_BASE_URL ?? 'http://localhost:3001';
const OUT = path.join(process.cwd(), 'public/help');

const ADMIN_PAGES = [
  { slug: 'analytics', path: '/admin/analytics' },
  { slug: 'stores', path: '/admin/stores' },
  { slug: 'stores-new', path: '/admin/stores/new' },
  { slug: 'vendors', path: '/admin/vendors' },
  { slug: 'customers', path: '/admin/customers' },
  { slug: 'requests', path: '/admin/requests' },
  { slug: 'reactivation-requests', path: '/admin/reactivation-requests' },
  { slug: 'imported-reviews', path: '/admin/reviews' },
  { slug: 'bank-transfers', path: '/admin/bank-transfers' },
  { slug: 'manual-payouts', path: '/admin/manual-payouts' },
  { slug: 'promotions', path: '/admin/promotions' },
  { slug: 'promotions-new', path: '/admin/promotions/new' },
  { slug: 'taxonomy', path: '/admin/taxonomy' },
  { slug: 'shipping', path: '/admin/shipping' },
  { slug: 'search-synonyms', path: '/admin/search/synonyms' },
  { slug: 'search-tuning', path: '/admin/search/tuning' },
  { slug: 'search-analytics', path: '/admin/search/analytics' },
  { slug: 'email-templates', path: '/admin/email/templates' },
  { slug: 'email-containers', path: '/admin/email/containers' },
  { slug: 'email-containers-new', path: '/admin/email/containers/new' },
  { slug: 'audit-logs', path: '/admin/audit-logs' },
  { slug: 'notifications', path: '/admin/notifications' },
  { slug: 'settings', path: '/admin/settings' },
  { slug: 'settings-bank-transfer', path: '/admin/settings?tab=bankTransfer' },
  { slug: 'settings-banners', path: '/admin/settings?tab=banners' },
  { slug: 'settings-storefront', path: '/admin/settings?tab=storefront' },
  { slug: 'team', path: '/admin/team' },
  { slug: 'profile', path: '/admin/profile' },
  { slug: 'help-index', path: '/guide/admin' },
];

const VENDOR_PAGES = [
  { slug: 'dashboard', path: '/vendor' },
  { slug: 'stores', path: '/vendor/stores' },
  { slug: 'requests', path: '/vendor/requests' },
  { slug: 'orders', path: '/vendor/orders?queue=action' },
  { slug: 'orders-all', path: '/vendor/orders?queue=all' },
  { slug: 'products', path: '/vendor/products' },
  { slug: 'products-new', path: '/vendor/products/new' },
  { slug: 'customers', path: '/vendor/customers' },
  { slug: 'reviews', path: '/vendor/reviews' },
  { slug: 'promotions', path: '/vendor/promotions' },
  { slug: 'promotions-new', path: '/vendor/promotions/new' },
  { slug: 'campaigns', path: '/vendor/campaigns' },
  { slug: 'campaigns-new', path: '/vendor/campaigns/new' },
  { slug: 'team', path: '/vendor/team' },
  { slug: 'api', path: '/vendor/api' },
  { slug: 'api-docs', path: '/vendor/api/docs' },
  { slug: 'payout', path: '/vendor/settings?tab=payout' },
  { slug: 'shipping-settings', path: '/vendor/settings?tab=shipping' },
  { slug: 'settings', path: '/vendor/settings' },
  { slug: 'settings-store', path: '/vendor/settings?tab=store' },
  { slug: 'notifications', path: '/vendor/notifications' },
  { slug: 'help-index', path: '/guide/vendor' },
];

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 45_000 }),
    page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click(),
  ]);
}

async function shot(page, file) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: file, fullPage: false });
}

async function capturePath(page, dir, slug, urlPath) {
  const file = path.join(dir, `${slug}.png`);
  await page.goto(`${BASE}${urlPath}`, { waitUntil: 'networkidle', timeout: 45_000 });
  await shot(page, file);
  console.log(`✓ ${path.basename(dir)}/${slug}.png`);
}

/** Prefer first “แก้ไข” / detail link, else first table row link. */
async function firstDetailHref(page) {
  const edit = page.getByRole('link', { name: /แก้ไข|ดูรายละเอียด|รายละเอียด/ }).first();
  if (await edit.count()) {
    return edit.getAttribute('href');
  }
  const any = page
    .locator('main a[href*="/"]')
    .filter({ hasNotText: /สร้าง|เพิ่ม|คู่มือ|ศูนย์/ })
    .first();
  if (await any.count()) {
    return any.getAttribute('href');
  }
  return null;
}

async function captureDynamicAdmin(page, dir) {
  // Store detail
  await page.goto(`${BASE}/admin/stores`, { waitUntil: 'networkidle' });
  let href = await firstDetailHref(page);
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'stores-detail.png'));
    console.log('✓ admin/stores-detail.png');
  }

  // Vendor detail
  await page.goto(`${BASE}/admin/vendors`, { waitUntil: 'networkidle' });
  href = await firstDetailHref(page);
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'vendors-detail.png'));
    console.log('✓ admin/vendors-detail.png');
  }

  // Customer detail
  await page.goto(`${BASE}/admin/customers`, { waitUntil: 'networkidle' });
  href = await firstDetailHref(page);
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'customers-detail.png'));
    console.log('✓ admin/customers-detail.png');
  }

  // First email template
  await page.goto(`${BASE}/admin/email/templates`, { waitUntil: 'networkidle' });
  const tmpl = page.locator('main a[href*="/admin/email/templates/"]').first();
  if (await tmpl.count()) {
    href = await tmpl.getAttribute('href');
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
      await shot(page, path.join(dir, 'email-template-detail.png'));
      console.log('✓ admin/email-template-detail.png');
    }
  }

  // Promotion type form (percentage)
  await page.goto(`${BASE}/admin/promotions/new/percentage`, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  });
  await shot(page, path.join(dir, 'promotions-form.png'));
  console.log('✓ admin/promotions-form.png');
}

async function captureDynamicVendor(page, dir) {
  // Order detail
  await page.goto(`${BASE}/vendor/orders?queue=all`, { waitUntil: 'networkidle' });
  let href = await firstDetailHref(page);
  if (!href) {
    const orderLink = page.locator('main a[href*="/vendor/orders/"]').first();
    if (await orderLink.count()) href = await orderLink.getAttribute('href');
  }
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'orders-detail.png'));
    console.log('✓ vendor/orders-detail.png');
  }

  // Product detail + edit + variants + stock
  await page.goto(`${BASE}/vendor/products`, { waitUntil: 'networkidle' });
  const productLink = page
    .locator('main a[href*="/vendor/products/"]')
    .filter({ hasNotText: /ใหม่|new/i })
    .first();
  href = (await productLink.count()) ? await productLink.getAttribute('href') : null;
  if (href) {
    const baseProduct = href.replace(/\/(edit|variants|stock)\/?$/, '');
    await page.goto(`${BASE}${baseProduct}`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'products-detail.png'));
    console.log('✓ vendor/products-detail.png');

    await page.goto(`${BASE}${baseProduct}/edit`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'products-edit.png'));
    console.log('✓ vendor/products-edit.png');

    await page.goto(`${BASE}${baseProduct}/variants`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'products-variants.png'));
    console.log('✓ vendor/products-variants.png');

    await page.goto(`${BASE}${baseProduct}/stock`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'products-stock.png'));
    console.log('✓ vendor/products-stock.png');
  }

  // Customer detail
  await page.goto(`${BASE}/vendor/customers`, { waitUntil: 'networkidle' });
  href = await firstDetailHref(page);
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await shot(page, path.join(dir, 'customers-detail.png'));
    console.log('✓ vendor/customers-detail.png');
  }

  // Promotion / campaign forms
  await page.goto(`${BASE}/vendor/promotions/new/percentage`, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  });
  await shot(page, path.join(dir, 'promotions-form.png'));
  console.log('✓ vendor/promotions-form.png');

  await page.goto(`${BASE}/vendor/campaigns/new`, { waitUntil: 'networkidle' });
  await shot(page, path.join(dir, 'campaigns-form.png'));
  console.log('✓ vendor/campaigns-form.png');
}

async function captureRole(role, email, pages) {
  const dir = path.join(OUT, role);
  mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await login(page, email, 'P@ssw0rd');

  for (const entry of pages) {
    try {
      await capturePath(page, dir, entry.slug, entry.path);
    } catch (error) {
      console.error(`✗ ${role}/${entry.slug}:`, error instanceof Error ? error.message : error);
    }
  }

  try {
    if (role === 'admin') await captureDynamicAdmin(page, dir);
    if (role === 'vendor') await captureDynamicVendor(page, dir);
  } catch (error) {
    console.error(`✗ ${role} dynamic:`, error instanceof Error ? error.message : error);
  }

  if (role === 'admin') {
    const sharedDir = path.join(OUT, 'shared');
    mkdirSync(sharedDir, { recursive: true });
    await context.clearCookies();
    try {
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      await shot(page, path.join(sharedDir, 'login.png'));
      console.log('✓ shared/login.png');

      await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
      await page.waitForTimeout(400);
      await shot(page, path.join(sharedDir, 'forgot-password.png'));
      console.log('✓ shared/forgot-password.png');

      await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
      await shot(page, path.join(sharedDir, 'register.png'));
      console.log('✓ shared/register.png');

      await page.goto(`${BASE}/guide`, { waitUntil: 'networkidle' });
      await shot(page, path.join(sharedDir, 'guide-hub.png'));
      console.log('✓ shared/guide-hub.png');
    } catch (error) {
      console.error('✗ shared auth shots:', error instanceof Error ? error.message : error);
    }
  }

  await browser.close();
}

async function main() {
  const only = process.argv[2] ?? 'all';
  if (only === 'all' || only === 'admin') {
    await captureRole('admin', 'admin@sopet.org', ADMIN_PAGES);
  }
  if (only === 'all' || only === 'vendor') {
    await captureRole('vendor', 'vendor@sopet.org', VENDOR_PAGES);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
