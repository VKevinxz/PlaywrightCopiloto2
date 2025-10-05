import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Revisor (Jurado Objetante) - Revisar y Aprobar Plan de Tesis', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // ========== PASO 1: LOGIN COMO JURADO OBJETANTE ==========
  console.log('👨‍⚖️ Iniciando sesión como Jurado Objetante...');
  
  console.log('📧 Llenando email del jurado objetante...');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(env.JURADO_EMAIL);
  
  console.log('🔐 Llenando contraseña del jurado objetante...');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(env.JURADO_PASSWORD);
  
  console.log('🔑 Haciendo click en "Iniciar Sesión"...');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  console.log('🔄 Esperando redirección post-login...');
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar redirecciones automáticas del jurado objetante
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando redirecciones automáticas del jurado objetante (${redirectCount + 1}/${maxRedirects})...`);
    
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
  
  const juradoUrl = page.url();
  console.log(`📍 URL final del jurado objetante: ${juradoUrl}`);
  
  // ========== PASO 2: COMPLETAR PERFIL BÁSICO (SI ES NECESARIO) ==========
  if (juradoUrl.includes('perfil')) {
    console.log('📝 Primer login del jurado - Completando perfil básico...');
    
    // Llenar teléfono (ORCID)
    console.log('📞 Llenando número ORCID...');
    await page.getByRole('textbox', { name: '-0000-0000-0000' }).fill(env.JURADO_ORCID);
    
    // Llenar CTI
    console.log('📋 Llenando número CTI...');
    await page.getByRole('textbox', { name: 'Número CTI' }).fill(env.JURADO_CTI);
    
    // Seleccionar especialidades (hacer click en opciones)
    console.log('🎓 Seleccionando especialidades...');
    await page.getByText('Gestión de Sistemas').click();
    await page.getByText('Gestión y Desarrollo de').click();
    
    // Guardar cambios del perfil
    console.log('💾 Guardando cambios del perfil...');
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();
    
    console.log('✅ Confirmando actualización de perfil...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Sí, actualizar datos' }).click();
    
    console.log('✅ Aceptando confirmación...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Entendido' }).click();
    await page.waitForTimeout(1000);
  }
  
  // ========== PASO 3: COMPLETAR POSTULACIÓN (SI ES NECESARIO) ==========
  currentUrl = page.url();
  if (currentUrl.includes('postulacion') || currentUrl.includes('perfil')) {
    console.log('📝 Completando postulación como jurado objetante...');
    
    // Llenar grado profesional
    console.log('🎓 Llenando grado profesional...');
    const gradoInput = page.getByRole('textbox', { name: 'Ej: Ingeniero de Sistemas e' });
    const isVisible = await gradoInput.isVisible().catch(() => false);
    
    if (isVisible) {
      await gradoInput.fill('Doctor en Ciencias de la Computación');
      
      // Seleccionar experiencia
      console.log('📊 Seleccionando experiencia...');
      await page.getByRole('combobox').nth(1).selectOption('mayor_3_anos');
      
      // Enviar postulación
      console.log('📤 Enviando postulación...');
      await page.getByRole('button', { name: 'Enviar Postulación' }).click();
      
      console.log('✅ Confirmando envío de postulación...');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Sí, enviar postulación' }).click();
      await page.waitForTimeout(1000);
    }
  }
  
  // ========== PASO 4: COMPLETAR PERFIL CON FIRMA (SI ES NECESARIO) ==========
  currentUrl = page.url();
  if (currentUrl.includes('perfil')) {
    console.log('🖊️ Subiendo firma escaneada del jurado objetante...');
    
    // 🔥 IMPORTANTE: No hacer click en "Choose File", solo setear el archivo directamente
    const firmaInput = page.locator('input[type="file"]');
    
    // Verificar que exista el input
    await firmaInput.waitFor({ state: 'attached', timeout: 5000 });
    
    // Subir archivo directamente (sin hacer click en el botón)
    await firmaInput.setInputFiles(env.FIRMA_JURADO);
    console.log('✅ Firma cargada correctamente');
    await page.waitForTimeout(1500); // Esperar a que se procese la imagen
    
    // Completar perfil
    console.log('💾 Completando perfil inicial del jurado...');
    await page.getByRole('button', { name: 'Completar Perfil Inicial' }).click();
    
    console.log('✅ Confirmando datos del perfil...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Sí, continuar' }).click();
    
    console.log('✅ Aceptando confirmación de perfil completado...');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Entendido' }).click();
    
    console.log('⏳ Esperando redirección post-perfil del jurado objetante...');
    await page.waitForURL(/localhost:5173\/(?!perfil)/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log(`📍 Redirigido a: ${page.url()}`);
  }
  
  // ========== PASO 5: REVISAR PLAN DE TESIS (JURADO OBJETANTE) ==========
  console.log('📋 Revisando plan de tesis como jurado objetante...');
  
  // 🔥 IMPORTANTE: Usar .nth(2) para el TERCER botón "Revisar Plan de Tesis"
  // nth(0) = Primer revisor (técnico)
  // nth(1) = Segundo revisor (metodológico)
  // nth(2) = Tercer revisor (jurado objetante)
  console.log('🔍 Buscando botón "Revisar Plan de Tesis" (tercero en la lista)...');
  const revisarPlanBtn = page.getByRole('button', { name: 'Revisar Plan de Tesis' }).nth(2);
  await revisarPlanBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  // Tomar screenshot antes de revisar
  console.log('📸 Tomando screenshot antes de revisar plan...');
  await page.screenshot({ path: 'tests/screenshots/antes-revisar-plan-jurado.png', fullPage: true });
  
  console.log('📝 Haciendo click en "Revisar Plan de Tesis"...');
  await revisarPlanBtn.click();
  await page.waitForTimeout(1000);
  
  // ========== PASO 6: APROBAR PLAN DE TESIS (DAR CONFORMIDAD) ==========
  console.log('✅ Aprobando plan de tesis (dar conformidad)...');
  
  // Buscar botón "Aprobar"
  console.log('🔍 Buscando botón "Aprobar"...');
  const aprobarBtn = page.getByRole('button', { name: 'Aprobar' });
  await aprobarBtn.waitFor({ state: 'visible', timeout: 10000 });
  
  console.log('✅ Haciendo click en "Aprobar"...');
  await aprobarBtn.click();
  
  // Confirmar aprobación (dar conformidad)
  console.log('✅ Confirmando aprobación del plan (dar conformidad)...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Sí, Dar Conformidad' }).click();
  
  // Primera confirmación
  console.log('✅ Aceptando primera confirmación...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  // Segunda confirmación (si aparece)
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(500);
  
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
  console.log('✅ Revisor (Jurado Objetante) dio conformidad al plan de tesis');
  await page.screenshot({ path: 'tests/screenshots/revisor-plan-jurado-aprobado.png', fullPage: true });
});
