// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Cargar variables de entorno desde archivo .env
require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Tiempo máximo para cada test */
  timeout: 30 * 1000,
  
  /* Tiempo máximo para cada acción (click, fill, etc) */
  expect: {
    timeout: 5000
  },

  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en tus tests con await page.goto('/') */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    /* Resolución de pantalla para todos los tests */
    viewport: { width: 1920, height: 1080 },
    
    /* Captura screenshot solo cuando falla */
    screenshot: 'only-on-failure',
    
    /* Graba video solo cuando falla */
    video: 'retain-on-failure',
    
    /* Graba traza cuando falla - útil para debugging */
    trace: 'on-first-retry',
    
    /* Configurar idioma y región para que Google use español */
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    
    /* Headers para simular navegador real */
    extraHTTPHeaders: {
      'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8'
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
