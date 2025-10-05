import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Revisor - Login y Aceptar Asesoría', async ({ page }) => {
  test.setTimeout(120000);
  
  // ========== PASO 1: LOGIN COMO REVISOR ==========
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  console.log('👨‍🏫 Iniciando sesión como revisor...');
  
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
  
  const revisorUrl = page.url();
  console.log(`📍 URL final del revisor: ${revisorUrl}`);
  
  // ========== PASO 2: COMPLETAR PERFIL DEL REVISOR (SI ES NECESARIO) ==========
  if (revisorUrl.includes('perfil')) {
    console.log('📝 Primer login del revisor - Completando perfil obligatorio...');
    
    // Cambiar a la pestaña "Firma Escaneada"
    console.log('🖊️ Cambiando a pestaña de Firma Escaneada...');
    await page.getByRole('button', { name: 'Firma Escaneada' }).click();
    await page.waitForTimeout(1000);
    
    // 🔥 IMPORTANTE: No hacer click en "Seleccionar archivo", solo setear el archivo directamente
    console.log('📤 Subiendo firma escaneada...');
    const firmaInput = page.locator('input[type="file"]');
    
    // Verificar que exista el input
    await firmaInput.waitFor({ state: 'attached', timeout: 5000 });
    
    // Subir archivo directamente (sin hacer click en el botón)
    await firmaInput.setInputFiles(env.FIRMA_REVISOR_TECNICO);
    console.log('✅ Firma cargada correctamente');
    await page.waitForTimeout(1500); // Esperar a que se procese la imagen
    
    // Completar perfil
    console.log('💾 Completando perfil del revisor...');
    await page.getByRole('button', { name: 'Completar Perfil Inicial' }).click();
    
    console.log('✅ Confirmando datos del perfil...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Sí, continuar' }).click();
    
    console.log('✅ Aceptando confirmación de perfil completado...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Entendido' }).click();
    
    console.log('⏳ Esperando redirección post-perfil del revisor...');
    await page.waitForURL(/localhost:5173\/(?!perfil)/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log(`📍 Redirigido a: ${page.url()}`);
  }
  
  // ========== PASO 3: ACEPTAR ASESORÍA TÉCNICA ==========
  console.log('✅ Buscando solicitud de asesoría para aceptar...');
  
  // Esperar a que aparezca el botón "Aceptar"
  const aceptarBtn = page.getByRole('button', { name: 'Aceptar', exact: true });
  await aceptarBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('📋 Haciendo click en "Aceptar" asesoría...');
  await aceptarBtn.click();
  
  console.log('✅ Confirmando aceptación de asesoría...');
  await page.getByRole('button', { name: 'Sí, Aceptar' }).click();
  
  console.log('✅ Aceptando confirmación final...');
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST DEL REVISOR COMPLETADO!');
  console.log('📋 Resumen:');
  console.log('  ✓ Login como revisor exitoso');
  console.log('  ✓ Perfil completado (si era necesario)');
  console.log('  ✓ Asesoría técnica aceptada');
  
  await page.screenshot({ path: 'tests/screenshots/revisor-asesoria-aceptada.png', fullPage: true });
});