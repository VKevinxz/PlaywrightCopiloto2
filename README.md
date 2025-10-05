# 🎓 Sistema de Tests Automatizados - Flujo de Tesis

Automatización E2E del flujo completo de trámites de tesis usando Playwright.

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Navegador Chromium (se instala automáticamente con Playwright)
- Tu aplicación corriendo en `http://localhost:5173`

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright (solo primera vez)
npx playwright install chromium
```

## ⚙️ Configuración

### 1. Copiar archivo de variables de entorno

```bash
# Windows PowerShell
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Configurar credenciales en `.env`

Edita el archivo `.env` y configura todas las credenciales necesarias:

```env
# Tesista
TESISTA_GOOGLE_EMAIL=tu-email@udh.edu.pe
TESISTA_GOOGLE_PASSWORD=tu-password-google
TESISTA_EMAIL=tu-email@udh.edu.pe
TESISTA_PASSWORD=tu-password-sistema

# Revisor Técnico
REVISOR_TECNICO_EMAIL=revisor@example.com
REVISOR_TECNICO_PASSWORD=password
REVISOR_TECNICO_NOMBRE=NOMBRE COMPLETO REVISOR TECNICO

# Revisor Metodológico
REVISOR_METODOLOGICO_EMAIL=metodologico@example.com
REVISOR_METODOLOGICO_PASSWORD=password
REVISOR_METODOLOGICO_NOMBRE=NOMBRE COMPLETO REVISOR METODOLOGICO

# Jurado Objetante
JURADO_EMAIL=jurado@example.com
JURADO_PASSWORD=password
JURADO_NOMBRE=NOMBRE COMPLETO JURADO OBJETANTE

# ... etc (ver .env.example para lista completa)
```

### 3. Copiar archivos de firmas

Coloca los archivos de firma en la carpeta `test-data/firmas/`:

```
test-data/
  firmas/
    Kevin_Vizcarra.png
    draw-signature.png
    Mayra_Villanueva.png
    Ethel_Lozano.png
    Secretario.png
    Decano.png
```

## 🎯 Ejecución de Tests

### Ejecutar flujo completo (15 tests secuenciales)

```bash
# Con visualización (headed)
npx playwright test tests/ --headed --project=chromium --workers=1

# Sin visualización (más rápido)
npx playwright test tests/ --project=chromium --workers=1
```

### Ejecutar un test específico

```bash
npx playwright test tests/01-tesista-solicitud.spec.js --headed --project=chromium
```

### Ver reporte de resultados

```bash
npx playwright show-report
```

## 📝 Flujo de Tests (15 pasos)

1. ✅ **01-tesista-solicitud** - Tesista solicita asesor (Google OAuth)
2. ✅ **02-revisor-aceptar** - Revisor técnico acepta
3. ✅ **03-paisi-designar-metodologico** - PAISI designa metodológico
4. ✅ **04-facultad-emitir-resolucion** - Facultad emite resolución de asesores
5. ✅ **05-tesista-solicitar-revision-plan** - Tesista solicita revisión de plan
6. ✅ **06-revisor-aprobar-plan** - Revisor técnico aprueba plan
7. ✅ **07-revisor-metodologico-aprobar-plan** - Revisor metodológico aprueba plan
8. ✅ **08-tesista-solicitar-jurado** - Tesista solicita jurado objetante
9. ✅ **09-paisi-designar-jurado** - PAISI designa jurado
10. ✅ **10-facultad-emitir-resolucion-jurado** - Facultad emite resolución de jurado
11. ✅ **11-tesista-solicitar-revision-jurado** - Tesista solicita revisión del jurado
12. ✅ **12-jurado-revisar-aprobar-plan** - Jurado objetante aprueba plan
13. ✅ **13-tesista-solicitar-aprobacion-tesis** - Tesista solicita aprobación de tesis
14. ✅ **14-paisi-solicitar-resolucion-aprobacion** - PAISI solicita resolución de aprobación
15. ✅ **15-facultad-emitir-resolucion-aprobacion** - Facultad emite resolución final

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- Los archivos de firma tampoco se suben (están en `.gitignore`)
- Usa `.env.example` como template para compartir con el equipo

## 🛠️ Scripts NPM Disponibles

```bash
npm run test              # Tests en modo headless
npm run test:headed       # Tests con visualización
npm run test:ui           # Abrir UI mode de Playwright
npm run test:debug        # Modo debug
npm run test:report       # Ver reporte HTML
npm run codegen           # Grabar nuevos tests
```

## 📸 Screenshots

Los screenshots se guardan automáticamente en:
- `tests/screenshots/` - Capturas durante la ejecución
- `test-results/` - Resultados y trazas de errores

## 🐛 Troubleshooting

### Error: "Variable de entorno no está definida"
- Verifica que tu archivo `.env` existe
- Asegúrate de que todas las variables requeridas están configuradas

### Error: "Cannot find file" (firmas)
- Verifica que copiaste los archivos de firma a `test-data/firmas/`
- Los nombres de archivo deben coincidir exactamente

### Tests fallan en secuencia
- Asegúrate de usar `--workers=1` para ejecución secuencial
- Cada test depende del anterior

## 🔧 Uso de Variables de Entorno en Tests

Ejemplo de cómo usar las variables en tus tests:

```javascript
import { test, expect } from '@playwright/test';
const env = require('../config/env.config');

test('Mi test', async ({ page }) => {
  // Usar URL base
  await page.goto(`${env.BASE_URL}/login`);
  
  // Usar credenciales
  await page.fill('[name="email"]', env.TESISTA_EMAIL);
  await page.fill('[name="password"]', env.TESISTA_PASSWORD);
  
  // Usar archivos
  await page.setInputFiles('input[type="file"]', env.FIRMA_REVISOR_TECNICO);
});
```

## 📚 Recursos Útiles

- [Documentación oficial de Playwright](https://playwright.dev)
- [Codegen Documentation](https://playwright.dev/docs/codegen)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 📄 Licencia

MIT

---

Desarrollado para automatizar el flujo de tesis de la UDH

## 📋 Requisitos Previos

- Node.js instalado
- Tu aplicación corriendo en `http://localhost:5173`

## 🚀 Comandos Importantes

### 1. **Codegen - Grabar tus interacciones**

Este es el comando más útil cuando estás empezando. Abre un navegador y graba tus clicks automáticamente:

```bash
npx playwright codegen http://localhost:5173
```

**¿Cómo funciona Codegen?**
1. Se abre una ventana del navegador y el Playwright Inspector
2. Navega por tu aplicación normalmente (haz click en botones, llena formularios, etc.)
3. Playwright genera automáticamente el código de prueba mientras interactúas
4. Copia el código generado y pégalo en un archivo de test

**Codegen con opciones adicionales:**

```bash
# Grabar en modo móvil (iPhone 12)
npx playwright codegen --device="iPhone 12" http://localhost:5173

# Grabar con un viewport específico
npx playwright codegen --viewport-size=1280,720 http://localhost:5173

# Grabar y guardar directamente en un archivo
npx playwright codegen --target javascript -o tests/mi-test.spec.js http://localhost:5173

# Grabar en modo oscuro
npx playwright codegen --color-scheme=dark http://localhost:5173
```

### 2. **Ejecutar los tests**

```bash
# Ejecutar todos los tests
npx playwright test

# Ejecutar un test específico
npx playwright test tests/example.spec.js

# Ejecutar tests en modo UI (interfaz visual)
npx playwright test --ui

# Ejecutar tests en modo debug
npx playwright test --debug

# Ejecutar tests solo en Chrome
npx playwright test --project=chromium
```

### 3. **Ver el reporte de resultados**

```bash
npx playwright show-report
```

### 4. **Abrir el Inspector para debugging**

```bash
npx playwright test --debug
```

## 📁 Estructura del Proyecto

```
playwright-tests/
├── tests/               # Tus archivos de test
│   └── example.spec.js
├── playwright.config.js # Configuración de Playwright
├── package.json
└── README.md
```

## 🎯 Ejemplo de Workflow

1. **Asegúrate de que tu aplicación esté corriendo:**
   ```bash
   # En otra terminal, inicia tu app en localhost:5173
   npm run dev
   ```

2. **Graba tus interacciones con Codegen:**
   ```bash
   npx playwright codegen http://localhost:5173
   ```

3. **Copia el código generado y créalo como un test:**
   - Crea un archivo en `tests/mi-prueba.spec.js`
   - Pega el código generado
   - Modifica según necesites

4. **Ejecuta tus tests:**
   ```bash
   npx playwright test
   ```

5. **Ve los resultados:**
   ```bash
   npx playwright show-report
   ```

## 📝 Ejemplo de Test Generado por Codegen

```javascript
const { test, expect } = require('@playwright/test');

test('login de usuario', async ({ page }) => {
  // Navegar a la página
  await page.goto('http://localhost:5173/');
  
  // Click en el botón de login
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Llenar el formulario
  await page.getByLabel('Email').fill('usuario@example.com');
  await page.getByLabel('Password').fill('mipassword');
  
  // Submit
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  
  // Verificar que se redirigió correctamente
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Verificar que un elemento está visible
  await expect(page.getByText('Bienvenido')).toBeVisible();
});
```

## 🔧 Configuración Actual

- **Base URL:** `http://localhost:5173`
- **Navegadores:** Chrome, Firefox, Safari
- **Screenshots:** Solo cuando falla un test
- **Videos:** Solo cuando falla un test
- **Trace:** En el primer reintento

## 📚 Recursos Útiles

- [Documentación oficial de Playwright](https://playwright.dev)
- [Codegen Documentation](https://playwright.dev/docs/codegen)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

## 💡 Tips

1. **Usa Codegen primero** para familiarizarte con los selectores
2. **Prefiere selectores semánticos** como `getByRole`, `getByLabel`, `getByText`
3. **Evita selectores frágiles** como IDs o clases CSS específicas
4. **Usa el modo UI** (`--ui`) para debugging visual
5. **Revisa el trace** cuando un test falla para ver qué pasó

## 🐛 Debugging

Si un test falla:

1. **Ver el trace:**
   ```bash
   npx playwright show-report
   ```
   Click en el test fallido para ver el trace completo

2. **Ejecutar en modo debug:**
   ```bash
   npx playwright test --debug tests/mi-test.spec.js
   ```

3. **Ejecutar en modo headed (ver el navegador):**
   ```bash
   npx playwright test --headed
   ```

4. **Slow motion (más lento para ver qué pasa):**
   ```bash
   npx playwright test --headed --slow-mo=1000
   ```

## ⚙️ Configuración Adicional

Edita `playwright.config.js` para cambiar:
- Timeout de tests
- URL base
- Navegadores a usar
- Opciones de screenshot/video
- Y mucho más...
