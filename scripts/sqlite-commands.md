# Comandos SQLite para Consola

Este archivo contiene una lista de comandos útiles para interactuar con la base de datos SQLite desde la consola.

## Comandos Básicos

1. **Abrir la base de datos**:
   ```bash
   sqlite3 sqlite.db
   ```

2. **Listar las tablas**:
   ```sql
   .tables
   ```

3. **Ver la estructura de una tabla**:
   ```sql
   .schema nombre_de_la_tabla
   ```

4. **Salir de SQLite**:
   ```sql
   .exit
   ```

## Consultas SQL

1. **Seleccionar todos los registros de una tabla**:
   ```sql
   SELECT * FROM nombre_de_la_tabla;
   ```

2. **Seleccionar registros con una condición**:
   ```sql
   SELECT * FROM nombre_de_la_tabla WHERE columna = 'valor';
   ```

3. **Seleccionar registros con un límite**:
   ```sql
   SELECT * FROM nombre_de_la_tabla LIMIT 10;
   ```

4. **Seleccionar registros ordenados**:
   ```sql
   SELECT * FROM nombre_de_la_tabla ORDER BY columna DESC;
   ```

5. **Contar registros**:
   ```sql
   SELECT COUNT(*) FROM nombre_de_la_tabla;
   ```

## Modificación de Registros

1. **Insertar un nuevo registro**:
   ```sql
   INSERT INTO nombre_de_la_tabla (columna1, columna2) VALUES ('valor1', 'valor2');
   ```

2. **Actualizar un registro**:
   ```sql
   UPDATE nombre_de_la_tabla SET columna1 = 'nuevo_valor' WHERE id = 1;
   ```

3. **Eliminar un registro**:
   ```sql
   DELETE FROM nombre_de_la_tabla WHERE id = 1;
   ```

## Exportar e Importar

1. **Exportar la base de datos a un archivo SQL**:
   ```bash
   sqlite3 sqlite.db .dump > dump.sql
   ```

2. **Importar un archivo SQL a la base de datos**:
   ```bash
   sqlite3 sqlite.db < dump.sql
   ```

3. **Exportar una tabla a CSV**:
   ```bash
   sqlite3 -header -csv sqlite.db "SELECT * FROM nombre_de_la_tabla;" > output.csv
   ```

## Comandos de Formato

1. **Mostrar encabezados**:
   ```sql
   .headers on
   ```

2. **Mostrar modo columna**:
   ```sql
   .mode column
   ```

3. **Mostrar modo lista**:
   ```sql
   .mode list
   ```

4. **Mostrar modo línea**:
   ```sql
   .mode line
   ```

## Ejemplos Prácticos

1. **Ver todos los destinatarios**:
   ```sql
   SELECT * FROM recipients;
   ```

2. **Ver todas las transacciones**:
   ```sql
   SELECT * FROM transactions;
   ```

3. **Ver todos los agentes**:
   ```sql
   SELECT * FROM agents;
   ```

4. **Ver transacciones de un agente específico**:
   ```sql
   SELECT * FROM transactions WHERE agent_id = 1;
   ```

5. **Ver transacciones en un rango de fechas**:
   ```sql
   SELECT * FROM transactions WHERE created_at BETWEEN '2023-01-01' AND '2023-12-31';
   ```

6. **Actualizar el estado de una transacción**:
   ```sql
   UPDATE transactions SET status = 'completed' WHERE id = 'transaction_id';
   ```

7. **Eliminar un agente**:
   ```sql
   DELETE FROM agents WHERE id = 1;
   ```

## Notas

- Reemplaza `nombre_de_la_tabla`, `columna`, `valor`, etc., con los nombres reales de tus tablas y datos.
- Asegúrate de tener los permisos necesarios para realizar operaciones de escritura en la base de datos.
- Siempre haz una copia de seguridad de tu base de datos antes de realizar cambios importantes.