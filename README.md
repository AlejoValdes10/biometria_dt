# 🛡️ Respeto Vial Colombia

Capacitación virtual obligatoria sobre normas de tránsito en Colombia con autenticación biométrica (Reconocimiento facial y WebAuthn/Passkeys) y un entorno gamificado corto y profesional para generar reflexión sobre la accidentalidad.

Un proyecto completo con Frontend en Next.js 15 y Backend en Flask (SQLite).

## 🚀 Inicio rápido local

### Frontend (Next.js)
```bash
cd app
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Backend (Flask + SQLite)
*Nota: El Frontend tiene toda la lógica simulada en `store.ts` para funcionar sin backend en caso de necesidad. El Backend puede conectarse editando la lógica de peticiones en un despliegue completo.*
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # (Windows)
# o
source venv/bin/activate # (Mac/Linux)

pip install -r requirements.txt
python app.py
```
El servidor backend estará en `http://localhost:5000` conectado a la base de datos `db.sqlite`.

---

## ☁️ Instrucciones de Despliegue Gratis

### 1. Despliegue del Frontend en Vercel (Gratis)
Vercel es la plataforma ideal (y gratuita) para alojar proyectos de Next.js.
1. Crea un repositorio en GitHub con el código fuente.
2. Inicia sesión en [Vercel](https://vercel.com).
3. Haz clic en **"Add New Project"** y conecta tu cuenta de GitHub.
4. Selecciona el repositorio de este proyecto.
5. En **Framework Preset** asegúrate de que esté seleccionado `Next.js`.
6. En **Root Directory**, selecciona la carpeta `app`, ya que allí reside el paquete de Next.js.
7. Haz clic en **Deploy**. ¡Listo!

### 2. Despliegue del Backend en Render (Gratis)
Si deseas usar Flask online, Render ofrece una capa gratuita excelente para Python + SQLite.
1. Crea tu cuenta en [Render](https://render.com).
2. Haz clic en **"New" -> "Web Service"**.
3. Conecta tu repositorio de GitHub.
4. En la configuración:
   - **Root Directory**: Deja en blanco o pon `backend` si subes la carpeta.
   - **Build Command**: `pip install -r requirements.txt` (o `pip install -r backend/requirements.txt`)
   - **Start Command**: `gunicorn app:app` (Asegúrate de agregar `gunicorn` en tu requirements.txt)
5. **Configuración de la Base de Datos (SQLite en Render)**:
   - Atención: Render en su plan gratuito no guarda persistencia de archivos si la máquina se reinicia (cada unas horas). Para SQLite en producción gratis es mejor usar "Render Disks" u opciones como Turso (SQLite Edge). 
6. Clic en **Create Web Service**.

> **Pro-Tip Mobile**: Para que la biometría (Face-api.js y WebAuthn/Passkeys) funcione en móviles, tu aplicación **DEBE** servirse a través de `https://` (Vercel lo hace automáticamente).

---

## 🔑 Credenciales de Prueba Offline
Al iniciar la app local, el sistema crea un Administrador de forma automática:
- **Correo**: admin@ciudadano.co
- **Contraseña**: admin123

## 📦 Estructura del Proyecto Limpio

```text
/
├── app/                  # Frontend Next.js 15
│   ├── public/models/    # Modelos neuronales de face-api.js
│   ├── src/app/          # Rutas y páginas (Capacitación a 3 Módulos)
│   ├── src/lib/          # store.ts (Manejo local WebAuthn y Biometría)
│   └── tailwind.config.ts # Paleta Gubernamental
│
└── backend/              # Server Python Flask (Opcional para persistencia)
    ├── app.py            # Servidor principal CORS
    ├── models.py         # Tablas SQLite 
    └── db.sqlite         # Base de datos local
```

## ⚖️ Licencia y Uso
Este código está destinado para la simulación educativa de concientización y respeto a las normas colombianas de tránsito.
