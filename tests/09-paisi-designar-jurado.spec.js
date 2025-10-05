import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('PAISI - Designar Jurado Objetante', async ({ page }) => {
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
  
  // ========== PASO 2: NAVEGAR A DESIGNACIÓN DE JURADOS ==========
  console.log('📋 Navegando a Designación de Jurados...');
  
  // Buscar y hacer click en el botón/enlace "Designación de Jurados"
  console.log('🔍 Buscando opción "Designación de Jurados"...');
  const designacionJuradosBtn = page.getByRole('button', { name: 'Designación de Jurados' });
  await designacionJuradosBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('📝 Haciendo click en "Designación de Jurados"...');
  await designacionJuradosBtn.click();
  await page.waitForTimeout(500);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 3: DESIGNAR JURADO OBJETANTE ==========
  console.log('📋 Designando Jurado Objetante...');
  
  // Buscar la fila con estado "Pendiente" y el tesista
  console.log('🔍 Buscando fila de solicitud pendiente...');
  const filaRow = page.getByRole('row', { name: /Pendiente.*KEVIN EDUARDO/i });
  await filaRow.waitFor({ state: 'visible', timeout: 10000 });
  
  // Seleccionar jurado objetante por nombre
  console.log('👨‍⚖️ Seleccionando jurado objetante "EDGARDO CRISTIAM IVAN LOPEZ DE LA CRUZ"...');
  const juradoSelect = filaRow.getByRole('combobox');
  await juradoSelect.waitFor({ state: 'visible', timeout: 5000 });
  
  // Esperar a que el select esté habilitado
  await page.waitForTimeout(500);
  
  // Seleccionar por label (texto visible)
  await juradoSelect.selectOption({ label: 'EDGARDO CRISTIAM IVAN LOPEZ DE LA CRUZ' });
  console.log('✅ Jurado objetante seleccionado');
  await page.waitForTimeout(300);
  
  // Llenar número de expediente
  console.log('📄 Llenando número de expediente...');
  const expedienteInput = page.getByRole('textbox', { name: 'Digite número de expediente' });
  await expedienteInput.waitFor({ state: 'visible', timeout: 5000 });
  await expedienteInput.fill(env.EXPEDIENTE_JURADO);
  await page.waitForTimeout(300);
  
  // Tomar screenshot antes de designar
  console.log('📸 Tomando screenshot antes de designar jurado...');
  await page.screenshot({ path: 'tests/screenshots/antes-designar-jurado.png', fullPage: true });
  
  // Hacer click en "Designar"
  console.log('✅ Haciendo click en "Designar"...');
  const designarBtn = page.getByRole('button', { name: 'Designar', exact: true });
  await designarBtn.waitFor({ state: 'visible', timeout: 5000 });
  await designarBtn.click();
  
  // Confirmar designación
  console.log('✅ Confirmando designación de jurado...');
  await page.getByRole('button', { name: 'Sí, Designar' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
  console.log('✅ PAISI designó el Jurado Objetante "EDGARDO CRISTIAM IVAN LOPEZ DE LA CRUZ"');
  console.log(`✅ Número de expediente asignado: ${env.EXPEDIENTE_JURADO}`);
  await page.screenshot({ path: 'tests/screenshots/paisi-jurado-designado.png', fullPage: true });
});