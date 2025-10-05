/**
 * Helper para acceder a las variables de entorno de forma segura
 * Lanza error si una variable requerida no está definida
 */

require('dotenv').config();
const path = require('path');

/**
 * Obtiene una variable de entorno o lanza error si no existe
 * @param {string} key - Nombre de la variable de entorno
 * @param {string} [defaultValue] - Valor por defecto opcional
 * @returns {string}
 */
function getEnv(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`Variable de entorno ${key} no está definida. Verifica tu archivo .env`);
  }
  
  return value;
}

/**
 * Convierte una ruta relativa del .env a ruta absoluta
 * @param {string} relativePath - Ruta relativa desde la raíz del proyecto
 * @returns {string}
 */
function getAbsolutePath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

// Exportar todas las variables de entorno como constantes
module.exports = {
  // URLs
  BASE_URL: getEnv('BASE_URL'),
  
  // Tesista - Google OAuth
  TESISTA_GOOGLE_EMAIL: getEnv('TESISTA_GOOGLE_EMAIL'),
  TESISTA_GOOGLE_PASSWORD: getEnv('TESISTA_GOOGLE_PASSWORD'),
  
  // Tesista - Login normal
  TESISTA_EMAIL: getEnv('TESISTA_EMAIL'),
  TESISTA_PASSWORD: getEnv('TESISTA_PASSWORD'),
  TESISTA_TELEFONO: getEnv('TESISTA_TELEFONO'),
  TESISTA_DEPARTAMENTO: getEnv('TESISTA_DEPARTAMENTO'),
  
  // Revisor Técnico
  REVISOR_TECNICO_EMAIL: getEnv('REVISOR_TECNICO_EMAIL'),
  REVISOR_TECNICO_PASSWORD: getEnv('REVISOR_TECNICO_PASSWORD'),
  
  // Revisor Metodológico
  REVISOR_METODOLOGICO_EMAIL: getEnv('REVISOR_METODOLOGICO_EMAIL'),
  REVISOR_METODOLOGICO_PASSWORD: getEnv('REVISOR_METODOLOGICO_PASSWORD'),
  
  // Jurado Objetante
  JURADO_EMAIL: getEnv('JURADO_EMAIL'),
  JURADO_PASSWORD: getEnv('JURADO_PASSWORD'),
  JURADO_ORCID: getEnv('JURADO_ORCID'),
  JURADO_CTI: getEnv('JURADO_CTI'),
  
  // PAISI
  PAISI_EMAIL: getEnv('PAISI_EMAIL'),
  PAISI_PASSWORD: getEnv('PAISI_PASSWORD'),
  
  // Facultad
  FACULTAD_EMAIL: getEnv('FACULTAD_EMAIL'),
  FACULTAD_PASSWORD: getEnv('FACULTAD_PASSWORD'),
  
  // Archivos de firmas (rutas absolutas)
  FIRMA_REVISOR_TECNICO: getAbsolutePath(getEnv('FIRMA_REVISOR_TECNICO')),
  FIRMA_REVISOR_METODOLOGICO: getAbsolutePath(getEnv('FIRMA_REVISOR_METODOLOGICO')),
  FIRMA_JURADO: getAbsolutePath(getEnv('FIRMA_JURADO')),
  FIRMA_PAISI: getAbsolutePath(getEnv('FIRMA_PAISI')),
  FIRMA_SECRETARIO: getAbsolutePath(getEnv('FIRMA_SECRETARIO')),
  FIRMA_DECANO: getAbsolutePath(getEnv('FIRMA_DECANO')),
  
  // Números de expedientes y resoluciones
  EXPEDIENTE_ASESORES: getEnv('EXPEDIENTE_ASESORES'),
  RESOLUCION_ASESORES: getEnv('RESOLUCION_ASESORES'),
  EXPEDIENTE_JURADO: getEnv('EXPEDIENTE_JURADO'),
  RESOLUCION_JURADO: getEnv('RESOLUCION_JURADO'),
  EXPEDIENTE_APROBACION: getEnv('EXPEDIENTE_APROBACION'),
  RESOLUCION_APROBACION: getEnv('RESOLUCION_APROBACION'),
};
