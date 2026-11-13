import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Attendre les polices : cause n°1 de diffs aléatoires
  await page.evaluate(() => document.fonts.ready);
});

test('page complète', async ({ page }) => {
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    // Le contenu dynamique est recouvert d'un aplat avant capture
    mask: [page.getByTestId('now')],
  });
});

test('composant : tableau des factures', async ({ page }) => {
  // Capture ciblée : un diff ailleurs dans la page ne casse pas ce test
  await expect(page.getByTestId('invoices')).toHaveScreenshot('invoices.png');
});

test('état : bouton au survol', async ({ page }) => {
  const button = page.getByTestId('cta-button');
  await button.hover();
  await expect(button).toHaveScreenshot('cta-hover.png');
});

test.describe('mode sombre', () => {
  test.use({ colorScheme: 'dark' });

  test('page complète', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      fullPage: true,
      mask: [page.getByTestId('now')],
    });
  });
});
