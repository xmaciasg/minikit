#!/usr/bin/env node

/**
 * Script de inicialización de base de datos
 * Se ejecuta antes de iniciar la aplicación en Railway
 * Crea las tablas si no existen
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function initDatabase() {
  try {
    const dataDir = process.env.DATA_DIR || '/app/data';
    const dbPath = path.join(dataDir, 'sqlite.db');
    
    console.log('🔧 Inicializando base de datos...');
    console.log(`   DB Path: ${dbPath}`);

    // Crear directorio si no existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`✓ Directorio creado: ${dataDir}`);
    }

    const db = new Database(dbPath);
    
    // Crear tabla recipients si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS recipients (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        wallet TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        bank_name TEXT,
        bank_account TEXT,
        account_type TEXT
      );
    `);
    console.log('✓ Tabla recipients lista');

    // Crear tabla agents si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        recipient_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        FOREIGN KEY (recipient_id) REFERENCES recipients(id)
      );
    `);
    console.log('✓ Tabla agents lista');

    // Crear tabla transactions si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        hash TEXT NOT NULL UNIQUE,
        recipient_id INTEGER,
        agent_id INTEGER,
        sender_name TEXT NOT NULL,
        sender_whatsapp TEXT NOT NULL,
        sender_bank_account TEXT NOT NULL,
        sender_bank_name TEXT NOT NULL,
        sender_account_type TEXT NOT NULL,
        amount REAL NOT NULL,
        exchange_rate REAL NOT NULL,
        commission_rate REAL NOT NULL,
        total_usd REAL NOT NULL,
        commission_usd REAL NOT NULL,
        net_amount_usd REAL NOT NULL,
        net_amount_wld REAL NOT NULL,
        status TEXT NOT NULL,
        transaction_id TEXT,
        recipient_completed INTEGER DEFAULT 0 NOT NULL,
        created_at INTEGER NOT NULL,
        broker_commission_rate REAL NOT NULL,
        agent_commission_rate REAL NOT NULL,
        broker_commission_usd REAL NOT NULL,
        agent_commission_usd REAL NOT NULL,
        token TEXT NOT NULL DEFAULT 'WLD',
        net_amount_token REAL NOT NULL,
        FOREIGN KEY (recipient_id) REFERENCES recipients(id),
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      );
    `);
    console.log('✓ Tabla transactions lista');

    // Crear índices si no existen
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS recipients_wallet_unique ON recipients(wallet);
      CREATE UNIQUE INDEX IF NOT EXISTS transactions_hash_unique ON transactions(hash);
    `);
    console.log('✓ Índices creados');

    // Verificar si hay datos iniciales
    const count = db.prepare('SELECT COUNT(*) as count FROM recipients').get();
    console.log(`✓ Total recipients: ${count.count}`);

    // Si está vacío, insertar datos iniciales
    if (count.count === 0) {
      console.log('📝 Insertando datos iniciales...');
      
      db.prepare(`
        INSERT INTO recipients (name, wallet, phone) 
        VALUES (?, ?, ?)
      `).run('Manta202', '0x5660199c29ce99cadade93c80f95f1e7e7d05c57', '+593998759222');
      
      console.log('✓ Recipient inicial insertado: Manta202');
    }

    db.close();
    console.log('✅ Base de datos inicializada correctamente\n');
  } catch (error) {
    console.error('❌ Error durante inicialización:', error.message);
    console.error(error);
    // No salir con error - permitir que continúe el start
  }
}

initDatabase();
