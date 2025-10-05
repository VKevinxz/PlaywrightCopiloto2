import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Facultad - Emitir Resolución de Asignación de Asesores', async ({ page }) => {
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
  
  // ========== PASO 2: COMPLETAR PERFIL DE FACULTAD (SI ES NECESARIO) ==========
  if (facultadUrl.includes('perfil')) {
    console.log('📝 Primer login de Facultad - Completando perfil obligatorio...');
    
    // PASO 2.1: Subir firma del Secretario
    console.log('🖊️ PASO 1/2: Subiendo firma del Secretario...');
    const firmaSecretarioInput = page.locator('div').filter({ 
      hasText: /^Subir firma escaneadaPNG, JPG hasta 2MBGuardar Firma del Secretario$/ 
    }).locator('input[type="file"]');
    
    await firmaSecretarioInput.waitFor({ state: 'attached', timeout: 5000 });
    await firmaSecretarioInput.setInputFiles(env.FIRMA_SECRETARIO);
    console.log('✅ Firma del Secretario cargada');
    await page.waitForTimeout(800);
    
    // Guardar firma del Secretario
    console.log('💾 Guardando firma del Secretario...');
    await page.getByRole('button', { name: 'Guardar Firma del Secretario' }).click();
    
    console.log('✅ Confirmando firma del Secretario...');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Sí, continuar' }).click();
    
    console.log('✅ Aceptando confirmación...');
    await page.getByRole('button', { name: 'Entendido' }).click();
    await page.waitForTimeout(500);
    
    // PASO 2.2: Subir firma del Decano
    console.log('🖊️ PASO 2/2: Subiendo firma del Decano...');
    const firmaDecanoInput = page.locator('div').filter({ 
      hasText: /^Subir firma escaneadaPNG, JPG hasta 2MBCompletar Perfil y Continuar$/ 
    }).locator('input[type="file"]');
    
    await firmaDecanoInput.waitFor({ state: 'attached', timeout: 5000 });
    await firmaDecanoInput.setInputFiles(env.FIRMA_DECANO);
    console.log('✅ Firma del Decano cargada');
    await page.waitForTimeout(800);
    
    // Completar perfil con firma del Decano
    console.log('💾 Completando perfil con firma del Decano...');
    await page.getByRole('button', { name: 'Completar Perfil y Continuar' }).click();
    
    console.log('✅ Confirmando firma del Decano...');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Sí, continuar' }).click();
    
    console.log('✅ Aceptando confirmación final del perfil...');
    await page.getByRole('button', { name: 'Entendido' }).click();
    
    console.log('⏳ Esperando redirección post-perfil de Facultad...');
    await page.waitForURL(/localhost:5173\/(?!perfil)/, { timeout: 10000 });
    console.log(`📍 Redirigido a: ${page.url()}`);
  }
  
  // ========== PASO 3: EMITIR RESOLUCIÓN DE ASIGNACIÓN DE ASESORES ==========
  console.log('📋 Emitiendo resolución de asignación de asesores...');
  
  // Buscar botón "Tramitar"
  console.log('🔍 Buscando botón "Tramitar"...');
  const tramitarBtn = page.getByRole('button', { name: 'Tramitar' });
  await tramitarBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('📝 Haciendo click en "Tramitar"...');
  await tramitarBtn.click();
  await page.waitForTimeout(500);
  
  // Llenar número de resolución
  console.log('📄 Llenando número de resolución...');
  const resolucionInput = page.getByRole('textbox', { name: 'Ej:' });
  await resolucionInput.waitFor({ state: 'visible', timeout: 5000 });
  await resolucionInput.fill(env.RESOLUCION_ASESORES);
  await page.waitForTimeout(300);
  
  // Tomar screenshot antes de tramitar
  console.log('📸 Tomando screenshot antes de tramitar...');
  await page.screenshot({ path: 'tests/screenshots/antes-tramitar-resolucion.png', fullPage: true });
  
  // Hacer click en "Tramitar Resolución"
  console.log('✅ Haciendo click en "Tramitar Resolución"...');
  const tramitarResolucionBtn = page.getByRole('button', { name: 'Tramitar Resolución' });
  await tramitarResolucionBtn.waitFor({ state: 'visible', timeout: 5000 });
  await tramitarResolucionBtn.click();
  
  // Confirmar tramitación
  console.log('✅ Confirmando tramitación de resolución...');
  await page.getByRole('button', { name: 'Sí, Tramitar' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ Facultad emitió resolución de asignación de asesores');
  await page.screenshot({ path: 'tests/screenshots/facultad-success.png', fullPage: true });
});