import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('PAISI - Solicitar Resolución de Aprobación de Tesis', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO PAISI ==========
  console.log('🏛️ Iniciando sesión como PAISI...');
  
  console.log('📧 Llenando email de PAISI...');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(env.PAISI_EMAIL);
  
  console.log('🔐 Llenando contraseña de PAISI...');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(env.PAISI_PASSWORD);
  
  console.log('🔑 Haciendo click en "Iniciar Sesión"...');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  console.log('🔄 Esperando redirección post-login...');
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar redirecciones automáticas de PAISI
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando redirecciones automáticas de PAISI (${redirectCount + 1}/${maxRedirects})...`);
    
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
  
  const paisiUrl = page.url();
  console.log(`📍 URL final de PAISI: ${paisiUrl}`);
  
  // ========== PASO 2: SOLICITAR RESOLUCIÓN DE APROBACIÓN DE TESIS ==========
  console.log('📋 Solicitando resolución de aprobación de tesis...');
  
  // Buscar botón "Solicitar Resolución de Aprobación"
  console.log('🔍 Buscando botón "Solicitar Resolución de Aprobación"...');
  const solicitarResolucionBtn = page.getByRole('button', { name: 'Solicitar Resolución de' });
  await solicitarResolucionBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  // Tomar screenshot antes de solicitar resolución
  console.log('📸 Tomando screenshot antes de solicitar resolución de aprobación...');
  await page.screenshot({ path: 'tests/screenshots/antes-paisi-solicitar-resolucion-aprobacion.png', fullPage: true });
  
  console.log('📝 Haciendo click en "Solicitar Resolución de Aprobación"...');
  await solicitarResolucionBtn.click();
  
  // ========== PASO 3: LLENAR NÚMERO DE EXPEDIENTE ==========
  console.log('📄 Llenando número de expediente...');
  const expedienteInput = page.getByRole('textbox', { name: 'Digite número de expediente' });
  await expedienteInput.waitFor({ state: 'visible', timeout: 5000 });
  await expedienteInput.fill(env.EXPEDIENTE_APROBACION);
  
  // ========== PASO 4: APROBAR SOLICITUD ==========
  console.log('✅ Haciendo click en "Aprobar"...');
  const aprobarBtn = page.getByRole('button', { name: 'Aprobar', exact: true });
  await aprobarBtn.waitFor({ state: 'visible', timeout: 5000 });
  await aprobarBtn.click();
  
  // Confirmar aprobación
  console.log('✅ Confirmando aprobación...');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Sí, Aprobar' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ PAISI solicitó resolución de aprobación de tesis');
  console.log(`✅ Número de expediente: ${env.EXPEDIENTE_APROBACION}`);
  await page.screenshot({ path: 'tests/screenshots/paisi-solicitar-resolucion-aprobacion-success.png', fullPage: true });
});
