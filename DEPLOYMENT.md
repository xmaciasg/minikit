# Guía de Instalación y Despliegue de la App WorldCoin MiniKit

Esta guía detalla el proceso paso a paso para desplegar la aplicación WorldCoin MiniKit en un servidor real, específicamente en un host compartido con panel Direct Admin. La aplicación es un template de Next.js que integra autenticación, verificación de identidad y pagos con WorldCoin.

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

- **Node.js 18 o superior** instalado localmente para el build.
- **Cuenta en WorldCoin Developer Portal** con credenciales válidas (APP_ID, DEV_PORTAL_API_KEY, WLD_CLIENT_ID, WLD_CLIENT_SECRET).
- **Servidor con Direct Admin** que soporte Node.js (verifica con tu proveedor de hosting).
- **Acceso FTP o File Manager** en Direct Admin.
- **Dominio configurado** apuntando al servidor.

**Nota importante**: Los hosts compartidos con Direct Admin suelen estar optimizados para PHP/MySQL. Desplegar una app Node.js puede ser limitado o no soportado. Si es posible, considera alternativas como Vercel o Netlify para despliegues más sencillos de Next.js. Si insistes en Direct Admin, verifica que tu plan soporte Node.js via Passenger o setups personalizados.

## Paso 1: Preparar el Código Localmente

1. Clona el repositorio en tu máquina local:
   ```
   git clone <url-del-repo>
   cd worldcoin-minikit-next-template
   ```

2. Instala las dependencias:
   ```
   npm install
   # o si usas pnpm: pnpm install
   ```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`:
     ```
     cp .env.example .env
     ```
   - Edita `.env` con tus credenciales reales:
     ```
     APP_ID=tu_app_id_de_worldcoin
     DEV_PORTAL_API_KEY=tu_clave_api
     WLD_CLIENT_ID=tu_client_id
     WLD_CLIENT_SECRET=tu_client_secret
     NEXTAUTH_SECRET=genera_un_secreto_aleatorio
     NEXTAUTH_URL=https://tu-dominio.com
     DATABASE_URL=file:./prod.db  # Cambiará en producción
     ```

4. Construye la aplicación para producción:
   ```
   npm run build
   ```
   Esto genera la carpeta `.next` con los archivos optimizados.

5. (Opcional) Prueba localmente:
   ```
   npm run dev
   ```
   Abre `http://localhost:3000` y verifica que funcione.

## Paso 2: Configurar la Base de Datos

La aplicación usa SQLite con Drizzle ORM, pero SQLite no es ideal para hosts compartidos (problemas de permisos de escritura y concurrencia). Recomiendo migrar a MySQL, que es estándar en Direct Admin.

1. En Direct Admin, crea una base de datos MySQL:
   - Ve a "MySQL Management" > "Create new Database".
   - Anota el nombre de la DB, usuario y contraseña.

2. Actualiza la configuración de la base de datos:
   - Edita `drizzle.config.ts` para usar MySQL:
     ```typescript
     import { defineConfig } from 'drizzle-kit';

     export default defineConfig({
       schema: './lib/schema.ts',
       out: './drizzle',
       dialect: 'mysql',
       dbCredentials: {
         host: 'localhost',  // o el host de tu DB
         user: 'tu_usuario_db',
         password: 'tu_password_db',
         database: 'tu_nombre_db',
       },
     });
     ```
   - Actualiza `lib/db.ts` para usar mysql2:
     ```typescript
     import { drizzle } from 'drizzle-orm/mysql2';
     import mysql from 'mysql2/promise';

     const connection = await mysql.createConnection({
       host: 'localhost',
       user: 'tu_usuario_db',
       password: 'tu_password_db',
       database: 'tu_nombre_db',
     });

     export const db = drizzle(connection);
     ```
   - Instala mysql2 si no está: `npm install mysql2`

3. Ejecuta las migraciones:
   ```
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

4. Ejecuta el seed para datos iniciales:
   ```
   npm run seed  # o node seed.ts
   ```

## Paso 3: Subir Archivos al Servidor

1. Comprime los archivos necesarios:
   - Crea un zip con: `.next/`, `public/`, `package.json`, `package-lock.json`, `lib/`, `components/`, `app/`, `.env` (con credenciales reales), y otros archivos esenciales (excluye `node_modules/`, `.git/`, archivos de dev).

2. Sube el zip via FTP o File Manager de Direct Admin:
   - Conecta via FTP (usa credenciales de tu cuenta).
   - O usa "File Manager" en Direct Admin para subir y extraer.

3. Extrae el zip en el directorio público (ej. `public_html/` o un subdirectorio como `app/`).

## Paso 4: Configurar Node.js en Direct Admin

Direct Admin soporta Node.js via "Node.js Selector" o setups manuales. Verifica si tu plan lo incluye.

1. En Direct Admin, ve a "Extra Features" > "Node.js Selector" (si disponible).
   - Selecciona la versión de Node.js (18+).
   - Apunta al directorio de tu app (ej. `/home/tu_usuario/public_html/app`).
   - Configura el script de inicio: `server.js` (Next.js genera uno en `.next/standalone/`).

   Para Next.js, es mejor usar el modo standalone:
   - En `next.config.mjs`, agrega:
     ```javascript
     module.exports = {
       output: 'standalone',
     };
     ```
   - Reconstruye y sube `.next/standalone/`.

2. Si no hay Node.js Selector, configura manualmente:
- Usa SSH si disponible, o contacta soporte para instalar Node.js.
- Ejecuta `npm install --production` en el servidor.
- Configura un proceso como PM2 o forever para mantener la app corriendo.

### Usar PM2 para Gestionar el Proceso de Node.js

Si tienes acceso SSH al servidor y puedes instalar software globalmente, PM2 es una excelente opción para mantener tu aplicación Next.js corriendo en producción, manejando reinicios automáticos y logs.

1. Instala PM2 globalmente:
   ```
   npm install -g pm2
   ```

2. Navega al directorio de tu aplicación (ej. `/home/tu_usuario/public_html/app`):
   ```
   cd /ruta/a/tu/app
   ```

3. Instala dependencias de producción (si no lo hiciste antes):
   ```
   npm install --production
   ```

4. Crea un archivo `ecosystem.config.js` en el directorio de la app para configurar PM2:
   ```javascript
   module.exports = {
     apps: [{
       name: 'worldcoin-minikit-app',
       script: 'server.js',  // Asegúrate de que apunte al script de inicio de Next.js (ver .next/standalone/server.js)
       instances: 1,  // Para shared hosting, usa 1 instancia
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000  // O el puerto asignado por tu hosting
       }
     }]
   };
   ```

5. Inicia la aplicación con PM2:
   ```
   pm2 start ecosystem.config.js
   ```

6. Verifica que esté corriendo:
   ```
   pm2 status
   pm2 logs worldcoin-minikit-app
   ```

7. Configura PM2 para iniciar automáticamente al reiniciar el servidor:
   ```
   pm2 startup
   pm2 save
   ```

8. Para actualizar la app en futuras versiones:
   - Sube nuevos archivos via FTP o File Manager.
   - Ejecuta `pm2 restart worldcoin-minikit-app` para aplicar cambios sin downtime.

**Nota**: En hosts compartidos con Direct Admin, PM2 puede no estar permitido debido a restricciones de seguridad. Si encuentras errores al instalar o ejecutar PM2, usa el Node.js Selector de Direct Admin o contacta a tu proveedor de hosting para alternativas. Forever es otra opción similar: `npm install -g forever` y `forever start server.js`.

3. Configura el puerto: Next.js por defecto usa 3000, pero en shared hosting, usa un puerto asignado o proxy via Apache/Nginx.

## Paso 5: Configurar el Dominio y SSL

1. En Direct Admin, configura el dominio:
   - Ve a "Domain Setup" y apunta tu dominio al directorio de la app.

2. Habilita SSL:
   - Usa "Let's Encrypt" en Direct Admin para certificado gratuito.

3. Actualiza `NEXTAUTH_URL` en `.env` con `https://tu-dominio.com`.

## Paso 6: Configurar en WorldCoin Developer Portal

Para que funcione como mini-app:

1. Ve a [WorldCoin Developer Portal](https://developer.worldcoin.org/).
2. Crea o edita tu app.
3. Configura la URL de la mini-app: `https://tu-dominio.com`.
4. Asegúrate de que las credenciales en `.env` coincidan.

## Paso 7: Probar el Despliegue

1. Abre `https://tu-dominio.com` en un navegador.
2. Prueba la autenticación: Haz sign in con World ID.
3. Prueba verificación: Usa el componente Verify.
4. Prueba pagos: Inicia un pago (requiere la app de WorldCoin para transacciones reales).
5. Verifica la página de destinatarios: `/recipient`.

Si hay errores, revisa logs en Direct Admin o contacta soporte.

## Solución de Problemas Comunes

- **Error de permisos en DB**: Asegúrate de que el usuario MySQL tenga permisos.
- **Node.js no disponible**: Contacta tu proveedor para habilitar Node.js.
- **Puertos bloqueados**: Usa proxy reverso en Apache.
- **MiniKit no funciona**: Solo funciona en la app de WorldCoin, no en navegador normal.

Si encuentras issues específicos, proporciona logs para ayudar.

## Paso 8: Configurar la Base de Datos para Destinatarios y Transacciones

Para las mejoras en el componente de pagos, se ha agregado soporte para destinatarios y transacciones usando Drizzle ORM con SQLite (o MySQL en producción).

1. Asegúrate de que el esquema de DB esté configurado (ver Paso 2).

2. Ejecuta el seed para insertar destinatarios iniciales:
   ```
   npm run seed
   ```
   Esto inserta un destinatario de ejemplo (ej. "Juan Pérez" con wallet específica).

3. Las transacciones se crean automáticamente al iniciar pagos y se confirman al completar.

4. Para ver transacciones como destinatario, accede a `/recipient` en la app (requiere wallet del destinatario).

5. En producción, migra a MySQL como en Paso 2, y actualiza `DATABASE_URL` en `.env` con la URL de MySQL.

Nota: SQLite es suficiente para desarrollo y hosts compartidos limitados, pero considera PostgreSQL o MySQL para escalabilidad.