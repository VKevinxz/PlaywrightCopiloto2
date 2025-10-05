import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Revisor (Asesor Técnico) - Revisar y Aprobar Plan de Tesis', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO REVISOR (ASESOR TÉCNICO) ==========
  console.log('👨‍🏫 Iniciando sesión como Revisor (Asesor Técnico)...');
  
  console.log('📧 Llenando email del revisor...');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(env.REVISOR_TECNICO_EMAIL);
  
  console.log('🔐 Llenando contraseña del revisor...');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(env.REVISOR_TECNICO_PASSWORD);
  
  console.log('🔑 Haciendo click en "Iniciar Sesión"...');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  console.log('🔄 Esperando redirección post-login...');
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar redirecciones automáticas del revisor
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando redirecciones automáticas del revisor (${redirectCount + 1}/${maxRedirects})...`);
    
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
  
  const revisorUrl = page.url();
  console.log(`📍 URL final del revisor: ${revisorUrl}`);
  
  // ========== PASO 2: REVISAR PLAN DE TESIS ==========
  console.log('📋 Revisando plan de tesis como asesor técnico...');
  
  // Buscar botón "Revisar Plan de Tesis" (primero en la lista)
  console.log('🔍 Buscando botón "Revisar Plan de Tesis"...');
  const revisarPlanBtn = page.getByRole('button', { name: 'Revisar Plan de Tesis' }).first();
  await revisarPlanBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  // Tomar screenshot antes de revisar
  console.log('📸 Tomando screenshot antes de revisar plan...');
  await page.screenshot({ path: 'tests/screenshots/antes-revisar-plan.png', fullPage: true });
  
  console.log('📝 Haciendo click en "Revisar Plan de Tesis"...');
  await revisarPlanBtn.click();
  await page.waitForTimeout(500);
  
  // ========== PASO 3: APROBAR PLAN DE TESIS ==========
  console.log('✅ Aprobando plan de tesis...');
  
  // Buscar botón "Aprobar"
  console.log('🔍 Buscando botón "Aprobar"...');
  const aprobarBtn = page.getByRole('button', { name: 'Aprobar' });
  await aprobarBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('✅ Haciendo click en "Aprobar"...');
  await aprobarBtn.click();
  
  // Confirmar aprobación
  console.log('✅ Confirmando aprobación del plan...');
  await page.getByRole('button', { name: 'Sí, Aprobar' }).click();
  
  // Primera confirmación
  console.log('✅ Aceptando primera confirmación...');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  // Segunda confirmación (si aparece)
  console.log('✅ Verificando si hay confirmación adicional...');
  await page.waitForTimeout(300);
  
  // Verificar si hay un segundo botón "Perfecto"
  const segundoPerfecto = page.getByRole('button', { name: 'Perfecto' });
  const isVisible = await segundoPerfecto.isVisible().catch(() => false);
  
  if (isVisible) {
    console.log('✅ Hay segunda confirmación, haciendo click...');
    await segundoPerfecto.click();
  } else {
    console.log('✅ No hay segunda confirmación, continuando...');
  }
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ Revisor (Asesor Técnico) aprobó el plan de tesis');
  await page.screenshot({ path: 'tests/screenshots/revisor-plan-aprobado.png', fullPage: true });
});