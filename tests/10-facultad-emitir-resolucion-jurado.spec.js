import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Facultad - Emitir Resolución de Designación de Jurado Objetante', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO FACULTAD ==========
  console.log('🏛️ Iniciando sesión como Facultad (FING)...');
  
  console.log('📧 Llenando email de Facultad...');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(env.FACULTAD_EMAIL);
  
  console.log('🔐 Llenando contraseña de Facultad...');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(env.FACULTAD_PASSWORD);
  
  console.log('🔑 Haciendo click en "Iniciar Sesión"...');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  console.log('🔄 Esperando redirección post-login...');
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar redirecciones automáticas de Facultad
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando redirecciones automáticas de Facultad (${redirectCount + 1}/${maxRedirects})...`);
    
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
  
  const facultadUrl = page.url();
  console.log(`📍 URL final de Facultad: ${facultadUrl}`);
  
  // ========== PASO 2: NAVEGAR A EMITIR RESOLUCIÓN DE JURADO (SI ES NECESARIO) ==========
  if (!facultadUrl.includes('emitir-resolucion-jurado')) {
    console.log('📋 Necesitamos navegar a Emitir Resolución de Jurado...');
    console.log('🔍 Buscando en sidebar "Emitir Resolución de Designación de Jurado objetante"...');
    
    // Puede estar en el sidebar como link o botón
    const linkJurado = page.locator('a, button').filter({ hasText: 'Emitir Resolución de Designación de Jurado objetante' });
    await linkJurado.first().click();
    
    console.log('⏳ Esperando navegación...');
    await page.waitForURL(/emitir-resolucion-jurado/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Esperar que cargue la tabla
  } else {
    console.log('✅ Ya estamos en la página de emisión de resolución de jurado');
    await page.waitForTimeout(2000); // Esperar que cargue la tabla
  }
  
  // ========== PASO 3: TRAMITAR RESOLUCIÓN DESDE LA TABLA ==========
  console.log('📋 Buscando botón "Tramitar" en la tabla...');
  
  // Tomar screenshot para debug
  console.log('📸 Tomando screenshot de la tabla...');
  await page.screenshot({ path: 'tests/screenshots/tabla-resolucion-jurado.png', fullPage: true });
  
  // Buscar el primer botón "Tramitar" en la tabla (estado PENDIENTE)
  console.log('🔍 Buscando primer botón "Tramitar" en estado pendiente...');
  const tramitarBtn = page.getByRole('button', { name: 'Tramitar' }).first();
  await tramitarBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('📝 Haciendo click en "Tramitar"...');
  await tramitarBtn.click();
  await page.waitForTimeout(1000);
  
  // ========== PASO 4: LLENAR NÚMERO DE RESOLUCIÓN EN EL MODAL ==========
  console.log('📄 Esperando que aparezca el modal...');
  await page.waitForTimeout(500);
  
  console.log('📄 Llenando número de resolución...');
  const resolucionInput = page.getByRole('textbox', { name: 'Ej:' });
  await resolucionInput.waitFor({ state: 'visible', timeout: 5000 });
  await resolucionInput.fill(env.RESOLUCION_JURADO);
  await page.waitForTimeout(500);
  
  // Tomar screenshot antes de tramitar
  console.log('📸 Tomando screenshot antes de tramitar resolución de jurado...');
  await page.screenshot({ path: 'tests/screenshots/antes-tramitar-resolucion-jurado.png', fullPage: true });
  
  // ========== PASO 5: TRAMITAR RESOLUCIÓN ==========
  console.log('✅ Haciendo click en "Tramitar Resolución"...');
  const tramitarResolucionBtn = page.getByRole('button', { name: 'Tramitar Resolución' });
  await tramitarResolucionBtn.waitFor({ state: 'visible', timeout: 5000 });
  await tramitarResolucionBtn.click();
  
  // Confirmar tramitación
  console.log('✅ Confirmando tramitación de resolución...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Sí, Tramitar' }).click();
  
  // Primera confirmación - "Continuar"
  console.log('✅ Aceptando primera confirmación...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Continuar' }).click();
  
  // Confirmación final - "Perfecto"
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ Facultad emitió resolución de designación de jurado objetante');
  console.log(`✅ Número de resolución: ${env.RESOLUCION_JURADO}`);
  await page.screenshot({ path: 'tests/screenshots/facultad-resolucion-jurado-success.png', fullPage: true });
});