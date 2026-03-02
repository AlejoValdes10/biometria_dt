# Respeto Vial Colombia

Aplicación de capacitación virtual obligatoria sobre normas de tránsito en Colombia, con soporte para biometría (WebAuthn / Reconocimiento facial) y panel de administración vía SQLite.

## Ejecución Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Genera la base de datos y prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Levanta el servidor exponiendo a la red local (para probar en el móvil):
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

## Pruebas en Móvil (Biometría y WebAuthn)

Para probar la cámara y la huella digital en un dispositivo móvil moderno, es estrictamente necesario un entorno seguro (HTTPS). Puedes usar **ngrok** para crear un túnel a tu servidor local:

1. Instala ngrok y asegúrate de tener una cuenta:
   ```bash
   ngrok http 3000
   ```
2. Abre la URL generada (`https://<tu-id>.ngrok-free.app`) en tu teléfono celular.
3. El inicio de sesión biométrico o WebAuthn debería pedirte permisos para la cámara o mostrarte el prompt nativo del dispositivo para Face ID/Touch ID/Huella dactilar.

## Despliegue (Vercel)

Esta aplicación está optimizada para desplegarse fácilmente en Vercel. 
- Conecta el repositorio desde el panel de Vercel.
- Asegúrate de que los comandos de build sean los estándar de Next.js.
- Durante el build, el schema de Prisma se genera automáticamente gracias a la dependencia instalada. (Nota: Para un entorno serverless con alta concurrencia en Vercel se recomienda cambiar SQLite por Postgres en `schema.prisma`).
