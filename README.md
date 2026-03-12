# Respeto Vial Colombia

Aplicación de capacitación virtual obligatoria sobre normas de tránsito en Colombia, con soporte para biometría (WebAuthn / Reconocimiento facial) y panel de administración conectado a PostgreSQL vía Prisma.

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

Esta aplicación está configurada para desplegarse fácilmente en Vercel utilizando una base de datos PostgreSQL gratuita de Neon.tech. ¡Asegúrate de seguir estos pasos para un despliegue exitoso!

1. **Crea una cuenta en Neon**: Regístrate en [Neon.tech](https://neon.tech/) y crea un nuevo proyecto de PostgreSQL.
2. **Copia la connection string**: En el dashboard de Neon, copia tu cadena de conexión (Ej: `postgresql://user:password@hostname/dbname?sslmode=require`).
3. **Crea un proyecto en Vercel**: Conecta tu repositorio de GitHub desde el panel de Vercel.
4. **Configura el Proyecto (¡Muy Importante!)**:
   - **Root Directory**: Déjalo vacío o escribe `.` (el proyecto está en la raíz).
   - **Build Command**: Sobrescribe el comando por defecto y escribe: `npx prisma generate && next build`
5. **Variables de Entorno**: Añade a Vercel las siguientes variables (*Environment Variables*):
   - `DATABASE_URL` = (Pega aquí la connection string de Neon)
6. **Despliega**: Finalmente dale a Deploy. Vercel ejecutará los comandos automáticamente.

> **Sincronización de Base de Datos:** Recuerda ejecutar `npx prisma db push` apuntando a tu URL en Neon para crear las tablas antes o inmediatamente después de desplegar.
