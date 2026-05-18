const { test, expect } = require('@playwright/test');

test('public landing page renders core elements', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.status()).toBe(200);

  await expect(page).toHaveTitle(/Same Solutions LLC/);
  await expect(page.locator('h1', { hasText: 'Same Solutions LLC' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Same Solutions for Different Problems' })).toBeVisible();
  await expect(page.locator('.credential-line', { hasText: '15+ Years Engineering at Major Automakers' })).toBeVisible();
  await expect(page.locator('.service-card')).toHaveCount(6);
  await expect(page.locator('footer p', { hasText: '© 2026' })).toBeVisible();
  await expect(page.locator('footer p', { hasText: 'Commerce Township' })).toBeVisible();
});

test('manage entry serves expected structure', async ({ page }) => {
  const response = await page.goto('/manage/');
  expect(response.status()).toBe(200);

  await expect(page).toHaveTitle('Same Solutions LLC - Business Manager');

  const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
  expect(themeColor).toBe('#101820');

  await expect(page.locator('link[href="utilities.css"]')).toHaveCount(1);

  const html = await page.content();
  expect(html).toContain("navigator.serviceWorker.register('sw.js')");

  // 9 top-nav tabs (DOM presence, not visibility — login overlay may cover them)
  await expect(page.locator('nav[role="navigation"] button')).toHaveCount(9);

  // Match by visible text — decoupled from legacy data-page attribute names
  const expectedLabels = ['Dashboard', 'Estimator', 'Customers', 'Work', 'Invoices', 'Quotes', 'Expenses', 'Reports', 'Knowledge'];
  for (const label of expectedLabels) {
    await expect(page.locator('nav[role="navigation"] button', { hasText: label })).toHaveCount(1);
  }
});

test('critical assets return 200', async ({ request }) => {
  const assets = ['/same-solutions-logo.svg', '/manage/utilities.css', '/manage/sw.js'];
  for (const path of assets) {
    const r = await request.get(path);
    expect(r.status(), `${path} should return 200`).toBe(200);
  }

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const robotsText = await robots.text();
  expect(robotsText).toContain('Disallow: /archive/');
});

test('mobile viewport — landing renders without horizontal scroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();
  await page.goto('/');

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalScroll, 'page should not require horizontal scroll at 375px').toBe(false);

  const h1 = page.locator('h1', { hasText: 'Same Solutions LLC' });
  await expect(h1).toBeVisible();
  const box = await h1.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y, 'h1 should sit above the 667px fold').toBeLessThan(667);

  await context.close();
});
