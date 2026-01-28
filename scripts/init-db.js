#!/usr/bin/env node

/**
 * Script de inicialización de base de datos
 * Se ejecuta antes de iniciar la aplicación en Railway
 */

const Database = require('better-sqlite3');
const path = require('path');

function initDatabase() {
  try {
    const dataDir = process.env.DATA_DIR || '.';
    const dbPath = path.join(dataDir, 'sqlite.db');
    
    console.log('🔧 Inicializando base de datos...');
    console.log(`   DB Path: ${dbPath}`);

    const db = new Database(dbPath);

    // Verificar que la tabla recipients existe
    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM recipients').get();
      console.log(`✓ Tabla recipients existe (${result.count} registros)`);

      // Si está vacía, insertar datos iniciales
      if (result.count === 0) {
        console.log('📝 Insertando datos iniciales...');
        
        db.prepare(`
          INSERT INTO recipients (name, wallet, phone) 
          VALUES (?, ?, ?)
        `).run('Manta202', '0x5660199c29ce99cadade93c80f95f1e7e7d05c57', '+593998759222');
        
        console.log('✓ Recipient inicial insertado: Manta202');
      }
    } catch (err) {
      console.log('⚠ Tabla recipients no existe aún (se creará en el build)');
    }

    db.close();
    console.log('✅ Base de datos lista\n');
  } catch (error) {
    console.error('❌ Error durante inicialización:', error.message);
    // No salir con error - permitir que continúe el start
  }
}

initDatabase();
