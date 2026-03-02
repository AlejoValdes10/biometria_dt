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

3. Levanta el servidor exponiendo a la red local:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
4. Usa ngrok para túnel HTTPS y test en móvil:
   ```bash
   ngrok http 3000
   ```

## Pruebas en Móvil (Biometría y WebAuthn)

Para probar la cámara y la huella digital en un dispositivo móvil moderno, es estrictamente necesario un entorno seguro (HTTPS). Usando el túnel creado por ngrok (ej: `https://<tu-id>.ngrok-free.app`) podrás acceder en tu teléfono celular y conceder permisos a la cámara o WebAuthn de forma correcta.

## Despliegue en Vercel & Neon.tech (PostgreSQL)

Esta aplicación está configurada para desplegarse fácilmente en Vercel utilizando una base de datos PostgreSQL gratuita de Neon.tech.

1. Crea una cuenta en [Neon.tech](https://neon.tech/) y un nuevo proyecto.
2. Copia la cadena de conexión a la base de datos (Ej: `postgresql://user:password@hostname/dbname?sslmode=require`).
3. En Vercel, crea un nuevo proyecto conectando tu repositorio de GitHub.
4. Antes de desplegar, añade las siguientes Variables de Entorno en la configuración de Vercel:
   - `DATABASE_URL` (Debe ser tu connection string de Neon)
   - `DIRECT_URL` (La misma connection string, usada para Prisma)
5. Finalmente, despliega el proyecto. Durante el proceso de build, Vercel ejecutará `npx prisma generate` de forma automática. Sincroniza la tabla creando modelos en Neon ejecutando localmente `npx prisma db push` con el URL de Neon.
