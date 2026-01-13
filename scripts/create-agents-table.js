const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Eliminar la tabla 'agents' si existe
const tableExists = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='agents'"
  )
  .get();

if (tableExists) {
  db.exec("DROP TABLE agents");
  console.log("Tabla 'agents' eliminada.");
}

// Crear la tabla 'agents' con el nombre de columna correcto
  db.exec(`
    CREATE TABLE agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      FOREIGN KEY (recipient_id) REFERENCES recipients(id)
    )
  `);
  console.log("Tabla 'agents' creada exitosamente con el nombre de columna correcto.");

db.close();