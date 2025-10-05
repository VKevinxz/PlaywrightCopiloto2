import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Facultad - Emitir Resolución de Aprobación de Tesis', async ({ page }) => {
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
  
  const facultadUrl = page.url();
  console.log(`📍 URL final de Facultad: ${facultadUrl}`);
  
  // 🔥 IMPORTANTE: Dar tiempo a que los datos del test anterior se reflejen en la BD
  console.log('⏳ Esperando a que los datos del proceso anterior se reflejen en la base de datos...');
  await page.waitForTimeout(2000);
  
  // ========== PASO 2: NAVEGAR A EMITIR RESOLUCIÓN DE APROBACIÓN (SI ES NECESARIO) ==========
  console.log('📋 Verificando si necesitamos navegar a Emitir Resolución de Aprobación...');
  
  if (!facultadUrl.includes('emitir-resolucion-aprobacion')) {
    console.log('� No estamos en la página de aprobación, buscando botón de navegación...');
    
    // Buscar y hacer clic en el botón "Emitir Resolución de aprobación"
    const navegarAprobacionBtn = page.getByRole('button', { name: 'Emitir Resolución de aprobaci' });
    const isVisible = await navegarAprobacionBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✅ Botón de navegación encontrado, haciendo clic...');
      await navegarAprobacionBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Esperar que cargue la tabla
    } else {
      console.log('⚠️ Botón no visible, navegando directamente por URL...');
      await page.goto(`${env.BASE_URL}/facultad/emitir-resolucion-aprobacion`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Esperar que cargue la tabla
    }
  } else {
    console.log('✅ Ya estamos en la página de emisión de resolución de aprobación');
    await page.waitForTimeout(1000); // Esperar que cargue la tabla
  }
  
  // ========== PASO 3: EMITIR RESOLUCIÓN DE APROBACIÓN ==========
  console.log('📋 Emitiendo resolución de aprobación de tesis...');
  
  // Tomar screenshot antes de emitir resolución
  console.log('📸 Tomando screenshot de la tabla...');
  await page.screenshot({ path: 'tests/screenshots/antes-facultad-emitir-resolucion-aprobacion.png', fullPage: true });
  
  // Verificar si ya estamos en el modal o necesitamos buscar el botón en la tabla
  const modalVisible = await page.getByRole('button', { name: 'Aprobar' }).isVisible().catch(() => false);
  
  if (!modalVisible) {
    console.log('🔍 Buscando botón "Emitir Resolución de aprobación" en la tabla...');
    
    // Buscar botón en la tabla (primera fila con estado pendiente)
    const emitirResolucionBtn = page.getByRole('button', { name: 'Emitir Resolución de aprobaci' }).first();
    await emitirResolucionBtn.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log('📝 Haciendo click en "Emitir Resolución de aprobación"...');
    await emitirResolucionBtn.click();
    await page.waitForTimeout(300);
  } else {
    console.log('✅ Ya estamos en el modal de emisión de resolución');
  }
  
  // ========== PASO 4: APROBAR SOLICITUD ==========
  console.log('✅ Aprobando solicitud...');
  const aprobarBtn = page.getByRole('button', { name: 'Aprobar' });
  await aprobarBtn.waitFor({ state: 'visible', timeout: 5000 });
  await aprobarBtn.click();
  await page.waitForTimeout(300);
  
  // ========== PASO 5: LLENAR NÚMERO DE RESOLUCIÓN ==========
  console.log('📄 Llenando número de resolución...');
  const resolucionInput = page.getByRole('textbox', { name: 'Ej:' });
  await resolucionInput.waitFor({ state: 'visible', timeout: 5000 });
  await resolucionInput.fill(env.RESOLUCION_APROBACION);
  
  // Tomar screenshot antes de tramitar
  console.log('📸 Tomando screenshot antes de tramitar resolución de aprobación...');
  await page.screenshot({ path: 'tests/screenshots/antes-tramitar-resolucion-aprobacion.png', fullPage: true });
  
  // ========== PASO 6: TRAMITAR RESOLUCIÓN ==========
  console.log('✅ Haciendo click en "Tramitar Resolución"...');
  const tramitarResolucionBtn = page.getByRole('button', { name: 'Tramitar Resolución' });
  await tramitarResolucionBtn.waitFor({ state: 'visible', timeout: 5000 });
  await tramitarResolucionBtn.click();
  
  // Confirmar tramitación
  console.log('✅ Confirmando tramitación de resolución...');
  await page.waitForTimeout(300);
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
  console.log('✅ Facultad emitió resolución de aprobación de tesis');
  console.log(`✅ Número de resolución: ${env.RESOLUCION_APROBACION}`);
  console.log('🎓 ¡FLUJO COMPLETO DE TESIS FINALIZADO!');
  await page.screenshot({ path: 'tests/screenshots/facultad-resolucion-aprobacion-success.png', fullPage: true });
});
