import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Tesista - Solicitar Revisión del Jurado Objetante', async ({ page }) => {
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
        page.waitForURL(url => url.toString() !== previousUrl, { timeout: 2000 }),
        page.waitForTimeout(2000)
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
  
  // ========== PASO 2: SOLICITAR REVISIÓN DEL JURADO OBJETANTE ==========
  console.log('📋 Solicitando revisión del jurado objetante...');
  
  // Buscar botón "Solicitar revisión"
  console.log('🔍 Buscando botón "Solicitar revisión"...');
  const solicitarRevisionBtn = page.getByRole('button', { name: 'Solicitar revisión' });
  await solicitarRevisionBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  // Tomar screenshot antes de solicitar revisión
  console.log('📸 Tomando screenshot antes de solicitar revisión del jurado...');
  await page.screenshot({ path: 'tests/screenshots/antes-solicitar-revision-jurado.png', fullPage: true });
  
  console.log('📝 Haciendo click en "Solicitar revisión"...');
  await solicitarRevisionBtn.click();
  
  // Confirmar solicitud de revisión
  console.log('✅ Confirmando solicitud de revisión del jurado...');
  await page.getByRole('button', { name: 'Sí, Solicitar' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ Tesista solicitó revisión del jurado objetante');
  await page.screenshot({ path: 'tests/screenshots/tesista-revision-jurado-success.png', fullPage: true });
});
