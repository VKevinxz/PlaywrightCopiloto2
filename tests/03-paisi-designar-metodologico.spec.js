import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('PAISI - Designar Asesor Metodológico', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO PAISI ==========
  console.log('🏛️ Iniciando sesión como PAISI (Programa Académico)...');
  
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
  
  const paisiUrl = page.url();
  console.log(`📍 URL final de PAISI: ${paisiUrl}`);
  
  // ========== PASO 2: COMPLETAR PERFIL DE PAISI (SI ES NECESARIO) ==========
  if (paisiUrl.includes('perfil')) {
    console.log('📝 Primer login de PAISI - Completando perfil obligatorio...');
    
    // 🔥 IMPORTANTE: Subir firma directamente sin hacer click en botón
    console.log('📤 Subiendo firma de PAISI...');
    const firmaPaisiInput = page.locator('input[type="file"]');
    
    // Verificar que exista el input
    await firmaPaisiInput.waitFor({ state: 'attached', timeout: 5000 });
    
    // Subir archivo directamente
    await firmaPaisiInput.setInputFiles(env.FIRMA_PAISI);
    console.log('✅ Firma de PAISI cargada correctamente');
    await page.waitForTimeout(1500);
    
    // Completar perfil
    console.log('💾 Completando perfil de PAISI...');
    await page.getByRole('button', { name: 'Completar Perfil Inicial' }).click();
    
    console.log('✅ Confirmando datos del perfil...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Sí, continuar' }).click();
    
    console.log('✅ Aceptando confirmación de perfil completado...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Entendido' }).click();
    
    console.log('⏳ Esperando redirección post-perfil de PAISI...');
    await page.waitForURL(/localhost:5173\/(?!perfil)/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log(`📍 Redirigido a: ${page.url()}`);
  }
  
  // ========== PASO 3: DESIGNAR ASESOR METODOLÓGICO ==========
  console.log('📋 Buscando solicitud para designar asesor metodológico...');
  
  // Esperar a que aparezca la fila con estado "Pendiente"
  console.log('🔍 Buscando fila de solicitud pendiente...');
  const filaRow = page.getByRole('row', { name: /Pendiente.*KEVIN EDUARDO/i });
  await filaRow.waitFor({ state: 'visible', timeout: 10000 });
  
  // Seleccionar asesor metodológico por nombre
  console.log('👨‍🏫 Seleccionando asesor metodológico "JOSE LEONARDO TOL CER"...');
  const asesorMetodologicoSelect = filaRow.getByRole('combobox');
  await asesorMetodologicoSelect.waitFor({ state: 'visible', timeout: 5000 });
  
  // Esperar a que el select esté habilitado
  await page.waitForTimeout(1000);
  
  // Seleccionar por label (texto visible)
  await asesorMetodologicoSelect.selectOption({ label: 'JOSE LEONARDO TOL CER' });
  console.log('✅ Asesor metodológico seleccionado');
  await page.waitForTimeout(500);
  
  // Llenar número de expediente
  console.log('📄 Llenando número de expediente...');
  const expedienteInput = page.getByRole('textbox', { name: 'Digite número de expediente' });
  await expedienteInput.waitFor({ state: 'visible', timeout: 5000 });
  await expedienteInput.fill(env.EXPEDIENTE_ASESORES);
  await page.waitForTimeout(500);
  
  // Tomar screenshot antes de designar
  console.log('📸 Tomando screenshot antes de designar...');
  await page.screenshot({ path: 'tests/screenshots/antes-designar.png', fullPage: true });
  
  // Hacer click en "Designar"
  console.log('✅ Haciendo click en "Designar"...');
  const designarBtn = page.getByRole('button', { name: 'Designar', exact: true });
  await designarBtn.waitFor({ state: 'visible', timeout: 5000 });
  await designarBtn.click();
  
  // Confirmar designación
  console.log('✅ Confirmando designación...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Sí, Designar' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ PAISI designó asesor metodológico y asignó expediente');
  await page.screenshot({ path: 'tests/screenshots/paisi-success.png', fullPage: true });
});