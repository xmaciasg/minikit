const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Verificar si la columna 'agent_id' existe en la tabla 'transactions'
const columnExists = db
  .prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='transactions'"
  )
  .get();

if (columnExists && !columnExists.sql.includes('agent_id')) {
  // Agregar la columna 'agent_id' a la tabla 'transactions'
  db.exec(`
    ALTER TABLE transactions ADD COLUMN agent_id INTEGER REFERENCES agents(id)
  `);
  console.log("Columna 'agent_id' agregada a la tabla 'transactions'.");
} else {
  console.log("La columna 'agent_id' ya existe en la tabla 'transactions'.");
}

db.close();