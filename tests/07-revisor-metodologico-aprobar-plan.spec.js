import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Revisor (Asesor Metodológico) - Revisar y Aprobar Plan de Tesis', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO REVISOR (ASESOR METODOLÓGICO) ==========
  console.log('👨‍🏫 Iniciando sesión como Revisor (Asesor Metodológico)...');
  
  console.log('📧 Llenando email del revisor metodológico...');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(env.REVISOR_METODOLOGICO_EMAIL);
  
  console.log('🔐 Llenando contraseña del revisor metodológico...');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(env.REVISOR_METODOLOGICO_PASSWORD);
  
  console.log('🔑 Haciendo click en "Iniciar Sesión"...');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  console.log('🔄 Esperando redirección post-login...');
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar redirecciones automáticas del revisor metodológico
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando redirecciones automáticas del revisor metodológico (${redirectCount + 1}/${maxRedirects})...`);
    
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
  console.log(`📍 URL final del revisor metodológico: ${revisorUrl}`);
  
  // ========== PASO 2: COMPLETAR PERFIL DEL REVISOR METODOLÓGICO (SI ES NECESARIO) ==========
  if (revisorUrl.includes('perfil')) {
    console.log('📝 Primer login del revisor metodológico - Completando perfil obligatorio...');
    
    // Cambiar a la pestaña "Firma Escaneada"
    console.log('🖊️ Cambiando a pestaña de Firma Escaneada...');
    await page.getByRole('button', { name: 'Firma Escaneada' }).click();
    await page.waitForTimeout(500);
    
    // 🔥 IMPORTANTE: No hacer click en "Choose File", solo setear el archivo directamente
    console.log('📤 Subiendo firma escaneada del revisor metodológico...');
    const firmaInput = page.locator('input[type="file"]');
    
    // Verificar que exista el input
    await firmaInput.waitFor({ state: 'attached', timeout: 5000 });
    
    // Subir archivo directamente (sin hacer click en el botón)
    await firmaInput.setInputFiles(env.FIRMA_REVISOR_METODOLOGICO);
    console.log('✅ Firma cargada correctamente');
    await page.waitForTimeout(800); // Esperar a que se procese la imagen
    
    // Completar perfil
    console.log('💾 Completando perfil del revisor metodológico...');
    await page.getByRole('button', { name: 'Completar Perfil Inicial' }).click();
    
    console.log('✅ Confirmando datos del perfil...');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Sí, continuar' }).click();
    
    console.log('✅ Aceptando confirmación de perfil completado...');
    await page.getByRole('button', { name: 'Entendido' }).click();
    
    console.log('⏳ Esperando redirección post-perfil del revisor metodológico...');
    await page.waitForURL(/localhost:5173\/(?!perfil)/, { timeout: 10000 });
    console.log(`📍 Redirigido a: ${page.url()}`);
  }
  
  // ========== PASO 3: REVISAR PLAN DE TESIS (METODOLÓGICO) ==========
  console.log('📋 Revisando plan de tesis como asesor metodológico...');
  
  // 🔥 IMPORTANTE: Usar .nth(1) para el SEGUNDO botón "Revisar Plan de Tesis"
  // nth(0) = Primer revisor (técnico)
  // nth(1) = Segundo revisor (metodológico)
  console.log('🔍 Buscando botón "Revisar Plan de Tesis" (segundo en la lista)...');
  const revisarPlanBtn = page.getByRole('button', { name: 'Revisar Plan de Tesis' }).nth(1);
  await revisarPlanBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  // Tomar screenshot antes de revisar
  console.log('📸 Tomando screenshot antes de revisar plan...');
  await page.screenshot({ path: 'tests/screenshots/antes-revisar-plan-metodologico.png', fullPage: true });
  
  console.log('📝 Haciendo click en "Revisar Plan de Tesis"...');
  await revisarPlanBtn.click();
  await page.waitForTimeout(500);
  
  // ========== PASO 4: APROBAR PLAN DE TESIS (METODOLÓGICO) ==========
  console.log('✅ Aprobando plan de tesis (metodología)...');
  
  // Buscar botón "Aprobar"
  console.log('🔍 Buscando botón "Aprobar"...');
  const aprobarBtn = page.getByRole('button', { name: 'Aprobar' });
  await aprobarBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('✅ Haciendo click en "Aprobar"...');
  await aprobarBtn.click();
  
  // Confirmar aprobación metodológica
  console.log('✅ Confirmando aprobación del plan (metodología)...');
  await page.getByRole('button', { name: 'Sí, Aprobar Metodología' }).click();
  
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
  console.log('✅ Revisor (Asesor Metodológico) aprobó el plan de tesis');
  await page.screenshot({ path: 'tests/screenshots/revisor-plan-metodologico-aprobado.png', fullPage: true });
});