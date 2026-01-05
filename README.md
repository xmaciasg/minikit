## Mini App de Pagos con WorldCoin MiniKit

Esta aplicación permite enviar pagos en criptomonedas (WLD) a destinatarios preestablecidos, con autenticación via World ID, verificación y enlace a blockchain.

## Características
- Autenticación con World ID usando IDKit
- Formulario para seleccionar destinatario, ingresar monto y datos personales
- Generación de hash único de transacción
- Confirmación de pagos via MiniKit
- Enlace a PolygonScan para ver transacciones
- Vista para destinatarios: Ver transacciones recibidas y marcar como completadas

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Para usar la aplicación, configura:

1. **Credenciales de World ID**
    Desde el [World ID Developer Portal](https://developer.worldcoin.org/):

    - Crea una app para obtener `NEXT_PUBLIC_APP_ID`
    - Obtén `DEV_PORTAL_API_KEY` de la sección API Keys
    - Crea una acción "sign-in" en "Incognito Actions" para autenticación

2. **Configurar Destinatarios**
    Edita el array `recipients` en `components/Pay/index.tsx` para agregar más destinatarios.

View docs: [Docs](https://docs.world.org/)

[Developer Portal](https://developer.worldcoin.org/)
