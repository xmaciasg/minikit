const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Verificar si la columna 'token' existe en la tabla 'transactions'
const columnExists = db
  .prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='transactions'"
  )
  .get();

if (columnExists && !columnExists.sql.includes('token')) {
  // Agregar la columna 'token' a la tabla 'transactions'
  db.exec(`
    ALTER TABLE transactions ADD COLUMN token TEXT NOT NULL DEFAULT 'WLD'
  `);
  console.log("Columna 'token' agregada a la tabla 'transactions'.");
} else {
  console.log("La columna 'token' ya existe en la tabla 'transactions'.");
}

// Verificar si la columna 'net_amount_token' existe
if (columnExists && !columnExists.sql.includes('net_amount_token')) {
  // Agregar la columna 'net_amount_token' a la tabla 'transactions'
  db.exec(`
    ALTER TABLE transactions ADD COLUMN net_amount_token REAL NOT NULL DEFAULT 0
  `);
  console.log("Columna 'net_amount_token' agregada a la tabla 'transactions'.");
} else {
  console.log("La columna 'net_amount_token' ya existe en la tabla 'transactions'.");
}

db.close();