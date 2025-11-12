# SumQuiz - Plataforma de Aprendizaje de Sumas para Niños

Aplicación web interactiva diseñada para que los niños practiquen sumas de manera divertida y educativa.

## Características

- 🎮 **3 Plantillas de Juego**: Modo Clásico, Flashcards y Reto Relámpago
- 📊 **Sistema de Puntuaciones**: Registro de tiempo, respuestas correctas y erróneas
- 🏆 **Ranking Global**: Compara tus resultados con otros jugadores
- 👤 **Autenticación**: Sistema de registro y login seguro
- ⏱️ **Cronómetro**: Mide el tiempo de cada sesión
- 📱 **Responsive**: Funciona en dispositivos móviles y tablets

## Tecnologías

### Frontend
- React 19
- TypeScript
- Vite
- React Router

### Backend
- PHP 7.4+
- MySQL/MariaDB
- PDO para conexiones seguras

## Instalación

### Requisitos Previos

- Node.js 18+ y npm
- PHP 7.4 o superior
- MySQL/MariaDB
- Servidor web (Apache/Nginx) o PHP built-in server

### 1. Clonar e Instalar Dependencias Frontend

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` y configura la URL de tu API:
```
VITE_API_URL=http://localhost/api
```

### 3. Configurar Base de Datos

1. Crea la base de datos ejecutando el script SQL:
```bash
mysql -u root -p < api/database.sql
```

2. Edita `api/config.php` con tus credenciales de base de datos:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sumquiz');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
```

### 4. Configurar Servidor Backend

#### Opción A: Servidor PHP Built-in (Desarrollo)
```bash
cd api
php -S localhost:8080
```

Ajusta `VITE_API_URL` en `.env` a `http://localhost:8080`

#### Opción B: Apache/Nginx (Producción)
- Coloca la carpeta `api` en tu directorio web
- Asegúrate de que mod_rewrite esté habilitado (Apache)
- Configura CORS según tu dominio

### 5. Ejecutar Frontend

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## Estructura del Proyecto

```
SumQuiz/
├── api/                    # Backend PHP
│   ├── config.php          # Configuración de BD
│   ├── database.sql        # Script de creación de BD
│   ├── register.php        # Endpoint de registro
│   ├── login.php           # Endpoint de login
│   ├── save_score.php      # Guardar puntuaciones
│   ├── scores.php          # Obtener rankings
│   └── validate_token.php  # Validar sesión
├── src/
│   ├── pages/              # Componentes de páginas
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Quiz.tsx
│   ├── services/           # Servicios API
│   │   └── api.ts
│   └── App.tsx             # Router principal
└── public/                 # Archivos estáticos
```

## API Endpoints

### POST `/api/register.php`
Registra un nuevo usuario.

### POST `/api/login.php`
Inicia sesión.

### POST `/api/save_score.php`
Guarda una puntuación (requiere token).

### GET `/api/scores.php`
Obtiene rankings:
- `?type=global` - Ranking global
- `?type=user&token=xxx` - Puntuaciones del usuario

### POST `/api/validate_token.php`
Valida un token de sesión.

Ver `api/README.md` para documentación completa.

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Seguridad

- Las contraseñas se hashean con `password_hash()` (bcrypt)
- Tokens de sesión con expiración automática
- Validación de entrada en todos los endpoints
- Prepared statements para prevenir SQL injection
- CORS configurado para desarrollo (ajustar en producción)

## Ideas para Futuras Mejoras

- 🎨 Sistema de logros y badges
- 📈 Gráficos de progreso personal
- 🎵 Efectos de sonido y música
- 🌐 Multiidioma
- 👨‍👩‍👧‍👦 Modo multijugador
- 📧 Notificaciones por email
- 🎯 Dificultades personalizables

## Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.
