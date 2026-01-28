# 🚀 Guía de Despliegue en VPS con Dokploy

Esta guía es para el despliegue definitivo en tu VPS usando Dokploy (plataforma de containerización similar a Caprover).

## Requisitos Previos

- VPS con Dokploy instalado y acceso administrativo
- Dominio apuntando a tu VPS
- Credenciales de WorldCoin Developer Portal
- SSH acceso al VPS

## Paso 1: Preparar el Código para Dokploy

### ⚠️ CAMBIOS NECESARIOS EN EL CÓDIGO (hacer cuando migremos a Dokploy):

Cuando pases a Dokploy, necesitarás hacer estos cambios:

#### 1. Actualizar `lib/db.ts`
**Razón:** Dokploy maneja volúmenes diferentes que Railway

```typescript
// CAMBIO NECESARIO: Usar /app/data en lugar de /data
const dataDir = process.env.DATA_DIR || '/app/data';
```

**Ubicación actual:** `/home/xavier/Developer/WorldCoin/PayFast/minikit/lib/db.ts` (línea ~8)

#### 2. Actualizar `drizzle.config.ts`
**Razón:** Consistencia con nueva ruta

```typescript
// CAMBIO NECESARIO: Usar /app/data en lugar de /data
const dataDir = process.env.DATA_DIR || '/app/data';
```

**Ubicación actual:** `/home/xavier/Developer/WorldCoin/PayFast/minikit/drizzle.config.ts` (línea ~4)

#### 3. Crear `Dockerfile` personalizado para Dokploy
**Razón:** Dokploy necesita instrucciones específicas de build

**Archivo a crear:** `/home/xavier/Developer/WorldCoin/PayFast/minikit/Dockerfile`

```dockerfile
FROM node:20.18.0-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --production && npm ci --only=dev

# Build
COPY . .
RUN npm run build

# Crear directorio para volumen
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "scripts/init-db.js", "&&", "next", "start", "-p", "3000"]
```

**Alternativa simplificada si Dokploy no requiere Dockerfile:**
Usar Procfile actual (ya existe) - Dokploy debería detectarlo automáticamente.

#### 4. Variables de entorno en Dokploy
**En el panel de Dokploy, configurar:**

```env
# Punto de montaje
DATA_DIR=/app/data

# Node environment
NODE_ENV=production

# WorldCoin
APP_ID=tu_app_id
DEV_PORTAL_API_KEY=tu_api_key
WLD_CLIENT_ID=tu_client_id
WLD_CLIENT_SECRET=tu_client_secret
NEXTAUTH_SECRET=tu_secreto
NEXTAUTH_URL=https://tu-dominio.com

# MiniKit
NEXT_PUBLIC_PAYFAST_URL=https://tu-dominio.com/sendmoney
```

#### 5. Configurar volumen en Dokploy
**En el panel:**
- Volume name: `sqlite-data`
- Mount path: `/app/data`

Esto asegura que la BD persista entre redeploys.

## Paso 2: Proceso de Migración de Railway a Dokploy

### Timeline recomendado:

1. **Fase 1 (Ahora):** Railway funcionando con volumen persistente
   - Estado: ✅ En progreso

2. **Fase 2 (Antes de migración):** Hacer backup de BD de Railway
   ```bash
   # En Railway, descargar sqlite.db
   # Ubicación: /data/sqlite.db
   ```

3. **Fase 3 (Día de migración):** Hacer cambios de código
   - Actualizar `lib/db.ts` → usar `/app/data`
   - Actualizar `drizzle.config.ts` → usar `/app/data`
   - Crear `Dockerfile` si es necesario
   - Hacer commit: `feat: Prepare for Dokploy deployment`

4. **Fase 4 (Día de migración):** Configurar Dokploy
   - Crear nuevo servicio en Dokploy
   - Configurar volumen `/app/data`
   - Agregar variables de entorno
   - Conectar repositorio Git

5. **Fase 5 (Día de migración):** Restaurar datos (si es necesario)
   - Si necesitas datos históricos, copiar `sqlite.db` al volumen de Dokploy
   - Comando: `docker cp sqlite.db dokploy-container:/app/data/sqlite.db`

## Paso 3: Diferencias Dokploy vs Railway

| Aspecto | Railway | Dokploy |
|--------|---------|---------|
| **Volumen** | `/data` | `/app/data` (configurable) |
| **Variables** | Panel gráfico | Panel de Dokploy o variables.env |
| **Build** | Automático desde Procfile | Procfile o Dockerfile |
| **Logs** | Panel integrado | SSH o panel Dokploy |
| **Restart** | Automático | Manual o automático (config) |
| **Backup BD** | Manual via panel | Manual via SSH |

## Paso 4: Testeo Pre-Migración

Antes de migrar a Dokploy definitivamente, podrías probar localmente:

```bash
# Simular ambiente Dokploy localmente
DATA_DIR=/tmp/dokploy-data npm start
```

Esto usa `/tmp/dokploy-data` como si fuera `/app/data` en Dokploy.

## Paso 5: Plan de Rollback

Si algo falla en Dokploy:

1. **Rollback rápido a Railway:**
   - BD de Railway sigue en volumen `/data`
   - Cambios de código se revierten fácilmente
   - Railway redeploy desde git anterior

2. **Restaurar datos en Dokploy:**
   ```bash
   # Si necesitas restaurar BD de Railway a Dokploy
   scp user@vps:/app/data/sqlite.db ./backup.db
   # Copiar a container de Dokploy
   ```

## ⚠️ IMPORTANTE: No hacer cambios hasta indicación

**CAMBIOS PENDIENTES (hacer cuando migremos a Dokploy):**

1. [ ] `lib/db.ts` - cambiar `/data` → `/app/data`
2. [ ] `drizzle.config.ts` - cambiar `/data` → `/app/data`
3. [ ] Crear `Dockerfile` si Dokploy lo requiere
4. [ ] Commit: `feat: Prepare for Dokploy deployment`
5. [ ] Actualizar este documento con logs de migración

**Para ahora:**
- ✅ Railway funcionando
- ✅ BD con volumen persistente
- ✅ Guía lista para cuando migremos

## Comando para Ejecutar en VPS (Dokploy)

Una vez configurado en Dokploy, el comando será:

```bash
# Dokploy ejecutará automáticamente:
node scripts/init-db.js && next start -p 3000
```

Esto es lo mismo que en Railway, así que el código es compatible - solo necesita ajuste de rutas.

## Notas Adicionales

- **Git:** No es necesario cambiar el repo, los cambios son mínimos
- **Compatibilidad:** Código actual funciona con Railway, con cambios pequeños funciona con Dokploy
- **BD:** Mismo SQLite en ambos, solo cambio de ruta
- **Zero-downtime:** Si usas el mismo dominio, el switch es transparente

---

**Última actualización:** 27 de enero de 2026  
**Estado:** Listo para migración cuando sea necesario
