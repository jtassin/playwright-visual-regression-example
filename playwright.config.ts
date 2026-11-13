import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // pas de retry : un diff visuel doit être déterministe, pas "flaky"
  reporter: [['html', { open: 'never' }], ['list']],

  // Baselines sans suffixe d'OS : on impose un rendu unique (image Docker Playwright),
  // en local comme en CI. Voir scripts/docker.sh.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',

  expect: {
    toHaveScreenshot: {
      animations: 'disabled', // fige les animations / transitions CSS
      caret: 'hide',
      scale: 'css',
      threshold: 0.2, // tolérance couleur par pixel (YIQ, 0..1)
      maxDiffPixelRatio: 0.001, // au-delà de 0,1 % de pixels différents : échec
    },
  },

  use: {
    baseURL: 'http://localhost:4173',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'node scripts/server.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
