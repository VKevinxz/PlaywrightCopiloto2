import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Tesista - Login Google y Solicitud de Asesoría', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('🌐 Navegando a página de login...');
  await page.goto(`${env.BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Buscando iframe de Google...');
  await page.waitForSelector('iframe[title="Botón de Acceder con Google"]', { timeout: 10000 });
  
  console.log('🖱️ Haciendo click en botón de Google...');
  const page1Promise = page.waitForEvent('popup');
  await page.locator('iframe[title="Botón de Acceder con Google"]').contentFrame().getByRole('button', { name: 'Acceder con Google. Se abre' }).click();
  const page1 = await page1Promise;
  
  console.log('📧 Llenando email...');
  await page1.getByRole('textbox', { name: 'Correo electrónico o teléfono' }).fill(env.TESISTA_GOOGLE_EMAIL);
  await page1.getByRole('button', { name: 'Siguiente' }).click();
  
  console.log('🔐 Llenando contraseña...');
  await page1.getByRole('textbox', { name: 'Ingresa tu contraseña' }).fill(env.TESISTA_GOOGLE_PASSWORD);
  await page1.getByRole('button', { name: 'Siguiente' }).click();
  
  console.log('⏳ Esperando cierre de popup de Google...');
  await page1.waitForEvent('close', { timeout: 20000 });
  
  console.log('🔄 Esperando redirección post-autenticación...');
  await page.bringToFront();
  
  // CLAVE: Esperar a que NO estemos en login
  await page.waitForURL(/localhost:5173\/(?!login)/, { timeout: 30000 });
  console.log(`📍 Primera redirección: ${page.url()}`);
  
  // Esperar a que la app complete TODAS sus redirecciones automáticas
  let previousUrl = '';
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (previousUrl !== currentUrl && redirectCount < maxRedirects) {
    previousUrl = currentUrl;
    console.log(`⏳ Esperando posibles redirecciones automáticas (${redirectCount + 1}/${maxRedirects})...`);
    
    try {
      await Promise.race([
        page.waitForURL(url => url.toString() !== previousUrl, { timeout: 2000 }),
        page.waitForTimeout(2000)
      ]);
    } catch (e) {
      // Timeout es normal si no hay más redirecciones
    }
    
    currentUrl = page.url();
    redirectCount++;
    
    if (currentUrl !== previousUrl) {
      console.log(`🔀 Redirección detectada: ${currentUrl}`);
    }
  }
  
  await page.waitForLoadState('networkidle');
  const finalUrl = page.url();
  console.log(`📍 URL final estable: ${finalUrl}`);
  
  // ========== PASO 1: COMPLETAR PERFIL (SI ES NECESARIO) ==========
  if (finalUrl.includes('perfil')) {
    console.log('📝 Primer login detectado - Completando perfil obligatorio...');
    
    await page.locator('input[type="tel"]').fill(env.TESISTA_TELEFONO);
    await page.getByRole('combobox').selectOption(env.TESISTA_DEPARTAMENTO);
    
    console.log('💾 Guardando perfil...');
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();
    await page.getByRole('button', { name: 'Sí, actualizar datos' }).click();
    await page.getByRole('button', { name: 'Entendido' }).click();
    
    console.log('⏳ Esperando redirección post-perfil...');
    await page.waitForURL(/localhost:5173\/(?!perfil)/, { timeout: 10000 });
    console.log(`📍 Redirigido a: ${page.url()}`);  
  }
  
  // ========== PASO 2: INICIAR TRÁMITE ==========
  if (!page.url().includes('solicitar-asesor')) {
    if (!page.url().includes('inicio-tramite')) {
      console.log('🔍 Navegando a inicio de trámite...');
      await page.goto('http://localhost:5173/tesista/inicio-tramite');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('✅ Ya estamos en inicio de trámite');
    }

    console.log('🔍 Buscando botón "Iniciar trámite"...');
    const iniciarBtn = page.getByRole('button', { name: 'Iniciar trámite' });
    await iniciarBtn.waitFor({ state: 'visible', timeout: 10000 });

    console.log('📋 Haciendo click en "Iniciar trámite"...');
    await iniciarBtn.click();

    // Manejar el primer SweetAlert (información del SAUH)
    console.log('✅ Confirmando alerta de sistema SAUH...');
    await page.getByRole('button', { name: 'Entendido, continuar' }).click();

    // Manejar el segundo SweetAlert (éxito)
    console.log('✅ Confirmando trámite iniciado...');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Esperar redirección a solicitar-asesor
    console.log('⏳ Esperando redirección a solicitar-asesor...');
    await page.waitForURL(/solicitar-asesor/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  } else {
    console.log('✅ Ya estamos en solicitar-asesor');
  }
  
  // ========== PASO 3: COMPLETAR FORMULARIO DE SOLICITUD DE ASESOR ==========
  console.log('📝 Completando formulario de solicitud de asesor...');
  
  // 🔥 ESPERAR A QUE CARGUEN LOS DATOS (selectores habilitados)
  console.log('⏳ Esperando a que carguen las opciones de los selectores...');
  await page.waitForTimeout(1000); // Dar tiempo para que los hooks carguen datos
  
  // Llenar título de tesis
  console.log('📄 Llenando título de tesis...');
  const tituloInput = page.getByPlaceholder('Ingrese el título de su tesis');
  await tituloInput.waitFor({ state: 'visible', timeout: 5000 });
  await tituloInput.fill('TEST AUTOMATIZADO - ' + Date.now());
  
  // 🔥 Seleccionar tipo de investigación con verificación
  console.log('🔬 Esperando que tipo de investigación esté habilitado...');
  const tipoSelect = page.locator('select').nth(0); // Primer select
  await tipoSelect.waitFor({ state: 'visible', timeout: 10000 });
  
  // Verificar que no esté disabled
  let tipoDisabled = await tipoSelect.getAttribute('disabled');
  if (tipoDisabled !== null) {
    console.log('⚠️ Selector de tipo aún deshabilitado, esperando...');
    await page.waitForTimeout(1500);
  }
  
  console.log('🔬 Seleccionando tipo de investigación "CUALITATIVA"...');
  await tipoSelect.selectOption({ label: 'CUALITATIVA' });
  await page.waitForTimeout(300);
  
  // 🔥 Seleccionar asesor técnico con verificación
  console.log('👨‍🏫 Esperando que asesor técnico esté habilitado...');
  const asesorSelect = page.locator('select').nth(1); // Segundo select
  await asesorSelect.waitFor({ state: 'visible', timeout: 10000 });
  
  let asesorDisabled = await asesorSelect.getAttribute('disabled');
  if (asesorDisabled !== null) {
    console.log('⚠️ Selector de asesor aún deshabilitado, esperando...');
    await page.waitForTimeout(1500);
  }
  
  console.log('👨‍🏫 Seleccionando asesor técnico "KEVIN VIZC BARR"...');
  await asesorSelect.selectOption({ label: 'KEVIN VIZC BARR' });
  await page.waitForTimeout(300);
  
  // 🔥 Seleccionar línea de investigación con verificación
  console.log('📊 Esperando que línea de investigación esté habilitada...');
  const lineaSelect = page.locator('select').nth(2); // Tercer select
  await lineaSelect.waitFor({ state: 'visible', timeout: 10000 });
  
  let lineaDisabled = await lineaSelect.getAttribute('disabled');
  if (lineaDisabled !== null) {
    console.log('⚠️ Selector de línea aún deshabilitado, esperando...');
    await page.waitForTimeout(1500);
  }
  
  console.log('📊 Seleccionando línea de investigación "Tecnologías de la información y comunicación"...');
  await lineaSelect.selectOption({ label: 'Tecnologías de la información y comunicación' });
  await page.waitForTimeout(300);
  
  // 🔥 TOMAR SCREENSHOT ANTES DE ENVIAR
  console.log('📸 Tomando screenshot del formulario completado...');
  await page.screenshot({ path: 'tests/screenshots/formulario-completado.png', fullPage: true });
  
  // 🔥 Enviar solicitud con verificación de estado
  console.log('📤 Buscando botón "Enviar"...');
  const enviarBtn = page.getByRole('button', { name: 'Enviar' });
  await enviarBtn.waitFor({ state: 'visible', timeout: 5000 });
  
  // Verificar que no esté deshabilitado
  const enviarDisabled = await enviarBtn.isDisabled();
  if (enviarDisabled) {
    console.log('⚠️ Botón Enviar está deshabilitado. Tomando screenshot...');
    await page.screenshot({ path: 'tests/screenshots/boton-deshabilitado.png', fullPage: true });
    throw new Error('El botón Enviar está deshabilitado');
  }
  
  console.log('📤 Haciendo click en "Enviar"...');
  await enviarBtn.click();
  
  // Confirmar en el SweetAlert
  console.log('✅ Confirmando envío de solicitud...');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  
  // Aceptar confirmación final
  console.log('✅ Aceptando confirmación final...');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Perfecto' }).click();
  
  console.log('🎉 ¡SOLICITUD ENVIADA EXITOSAMENTE!');
  await page.screenshot({ path: 'tests/screenshots/solicitud-enviada.png', fullPage: true });
  
  // ========== PASO 4: CERRAR SESIÓN DEL TESISTA ==========
  console.log('🚪 Cerrando sesión del tesista...');
  
  // Hacer click en el botón de perfil/menú (el tercer botón sin texto)
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
  await page.waitForTimeout(300);
  
  // Hacer click en "Cerrar sesión"
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  
  console.log('⏳ Esperando redirección a login...');
  await page.waitForURL(/login/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  console.log('✅ ¡TEST DEL TESISTA COMPLETADO!');
  console.log('📋 Resumen:');
  console.log('  ✓ Login con Google exitoso');
  console.log('  ✓ Perfil completado (si era necesario)');
  console.log('  ✓ Trámite iniciado');
  console.log('  ✓ Solicitud de asesoría enviada');
  console.log('  ✓ Sesión cerrada correctamente');
});