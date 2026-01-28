# 🚂 Guía Rápida de Deploy en Railway

## Para Deploy Nuevo o Completamente Limpio

### Paso 1: Crear el Servicio
1. Ve a [railway.app](https://railway.app)
2. Crea nuevo proyecto
3. Conecta tu repositorio de GitHub

### Paso 2: Configurar Volumen (CRÍTICO)
**Sin esto, perderás datos entre redeploys**

1. En tu servicio → "Volumes"
2. "+ Add Volume"
3. Mount Path: `/data`
4. El volumen se crea automáticamente

### Paso 3: Configurar Variables de Entorno
1. En tu servicio → "Variables"
2. Agrega estas variables:

```env
# Base de datos
DATA_DIR=/data

# WorldCoin
APP_ID=tu_app_id
DEV_PORTAL_API_KEY=tu_api_key
WLD_CLIENT_ID=tu_client_id
WLD_CLIENT_SECRET=tu_client_secret
NEXTAUTH_SECRET=tu_secreto_aleatorio
NEXTAUTH_URL=https://tu-dominio.railway.app

# MiniKit (opcional)
NEXT_PUBLIC_PAYFAST_URL=https://tu-dominio.railway.app/sendmoney
```

### Paso 4: Deploy
1. Railway detecta cambios en GitHub
2. Ejecuta `npm run build`
3. Ejecuta `npm start` (que corre `init-db.js` primero)
4. Tu BD se inicializa automáticamente ✅

## Datos Iniciales
El script `scripts/init-db.js` automáticamente:
- ✓ Verifica que la tabla `recipients` existe
- ✓ Si está vacía, inserta recipient de ejemplo: **Manta202**

## Después del Primer Deploy
- Solo haz `git push`
- Railway redeploy automático
- Tu volumen `/data` persiste
- Datos y transacciones se mantienen 🎉

## Troubleshooting

### "n.map is not a function"
- Asegúrate que el volumen está creado y `DATA_DIR=/data` está configurado
- Revisa logs en Railway → "Logs"

### "Error: table recipients already exists"
- Esto es normal en el primer deploy
- Solo significa que se saltó la inicialización

### Datos vacíos después de deploy
- Verifica que `DATA_DIR=/data` esté en variables
- Verifica que el volumen está montado en `/data`

## Para Próximos Deploys

Si necesitas crear un nuevo servicio Railway:
1. Repite pasos 1-4 arriba
2. El script `init-db.js` maneja la BD automáticamente
3. Listo 🚀
