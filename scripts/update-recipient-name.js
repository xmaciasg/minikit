const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
  // Actualizar el nombre del destinatario
  const stmt = db.prepare("UPDATE recipients SET name = ? WHERE name = ?");
  const result = stmt.run('Manta202', 'Mauricio Calero');

  if (result.changes > 0) {
    console.log(`Nombre del destinatario actualizado exitosamente. Filas afectadas: ${result.changes}`);
  } else {
    console.log('No se encontró el destinatario con el nombre "Mauricio Calero".');
  }
} catch (err) {
  console.error('Error al actualizar el nombre del destinatario:', err);
} finally {
  db.close();
}