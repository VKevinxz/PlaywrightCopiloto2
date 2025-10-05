import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Tesista - Solicitar Aprobación de Tesis', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO TESISTA ==========
  console.log('👨‍🎓 Iniciando sesión como Tesista...');
  
  console.log('📧 Llenando email del tesista...');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(env.TESISTA_EMAIL);
  
  console.log('🔐 Llenando contraseña del tesista...');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(env.TESISTA_PASSWORD);
  
  console.log('🔑 Haciendo click en "Iniciar Sesión"...');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  console.log('🔄 Esperando redirección post-login...');
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar redirecciones automáticas del tesista
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando redirecciones automáticas del tesista (${redirectCount + 1}/${maxRedirects})...`);
    
    try {
      await Promise.race([
        page.waitForURL(url => url.toString() !== previousUrl, { timeout: 3000 }),
        page.waitForTimeout(3000)
      ]);
    } catch (e) {
      // Timeout es normal
    }
    
    currentUrl = page.url();
    redirectCount++;
    
    if (currentUrl !== previousUrl) {
      console.log(`🔀 Redirección detectada: ${currentUrl}`);
    }
  }
  
  const tesistaUrl = page.url();
  console.log(`📍 URL final del tesista: ${tesistaUrl}`);
  
  // ========== PASO 2: SOLICITAR APROBACIÓN DE TESIS ==========
  console.log('📋 Solicitando aprobación de tesis...');
  
  // Buscar botón "Solicitar Aprobación de Tesis"
  console.log('🔍 Buscando botón "Solicitar Aprobación de Tesis"...');
  const solicitarAprobacionBtn = page.getByRole('button', { name: 'Solicitar Aprobación de Tesis' });
  await solicitarAprobacionBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  // Tomar screenshot antes de solicitar aprobación
  console.log('📸 Tomando screenshot antes de solicitar aprobación de tesis...');
  await page.screenshot({ path: 'tests/screenshots/antes-solicitar-aprobacion-tesis.png', fullPage: true });
  
  console.log('📝 Haciendo click en "Solicitar Aprobación de Tesis"...');
  await solicitarAprobacionBtn.click();
  
  // Confirmar solicitud de aprobación
  console.log('✅ Confirmando solicitud de aprobación de tesis...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Sí, Solicitar Aprobación' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ Tesista solicitó aprobación de tesis');
  await page.screenshot({ path: 'tests/screenshots/tesista-aprobacion-tesis-success.png', fullPage: true });
});
