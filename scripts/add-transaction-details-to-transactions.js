const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

// Verificar si las columnas existen en la tabla 'transactions'
const tableInfo = db
  .prepare(
    "PRAGMA table_info(transactions)"
  )
  .all();

const columnsToAdd = [
  { name: 'exchange_rate', type: 'REAL NOT NULL DEFAULT 0' },
  { name: 'commission_rate', type: 'REAL NOT NULL DEFAULT 0' },
  { name: 'total_usd', type: 'REAL NOT NULL DEFAULT 0' },
  { name: 'commission_usd', type: 'REAL NOT NULL DEFAULT 0' },
  { name: 'net_amount_usd', type: 'REAL NOT NULL DEFAULT 0' },
  { name: 'net_amount_wld', type: 'REAL NOT NULL DEFAULT 0' },
];

columnsToAdd.forEach(column => {
  const columnExists = tableInfo.some(col => col.name === column.name);
  if (!columnExists) {
    db.exec(`ALTER TABLE transactions ADD COLUMN ${column.name} ${column.type}`);
    console.log(`Columna '${column.name}' agregada a la tabla 'transactions'.`);
  } else {
    console.log(`La columna '${column.name}' ya existe en la tabla 'transactions'.`);
  }
});

db.close();