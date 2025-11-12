# API Backend - SumQuiz

Backend PHP simple para la aplicación SumQuiz.

## Requisitos

- PHP 7.4 o superior
- MySQL/MariaDB
- Extensiones PHP: PDO, PDO_MySQL, JSON

## Instalación

1. **Crear la base de datos:**
   ```bash
   mysql -u root -p < database.sql
   ```

2. **Configurar la conexión:**
   Edita `config.php` y ajusta los valores de conexión:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'sumquiz');
   define('DB_USER', 'tu_usuario');
   define('DB_PASS', 'tu_contraseña');
   ```

3. **Configurar el servidor web:**
   - Asegúrate de que la carpeta `api` sea accesible desde tu servidor web
   - Si usas Apache, el archivo `.htaccess` ya está configurado
   - Si usas otro servidor, configura CORS manualmente

## Endpoints

### POST `/api/register.php`
Registra un nuevo usuario.

**Body (JSON):**
```json
{
  "username": "usuario123",
  "password": "contraseña123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "token_de_sesion",
    "user": {
      "id": 1,
      "username": "usuario123"
    }
  }
}
```

### POST `/api/login.php`
Inicia sesión con un usuario existente.

**Body (JSON):**
```json
{
  "username": "usuario123",
  "password": "contraseña123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "token_de_sesion",
    "user": {
      "id": 1,
      "username": "usuario123"
    }
  }
}
```

### POST `/api/save_score.php`
Guarda una puntuación del usuario.

**Headers:**
```
Authorization: Bearer token_de_sesion
```

**Body (JSON):**
```json
{
  "tiempo_segundos": 120,
  "total_realizadas": 30,
  "correctas": 25,
  "erroneas": 5
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Puntuación guardada exitosamente",
  "data": {
    "score_id": 1,
    "tiempo_segundos": 120,
    "total_realizadas": 30,
    "correctas": 25,
    "erroneas": 5
  }
}
```

### GET `/api/scores.php`
Obtiene puntuaciones.

**Parámetros:**
- `type`: `global` (por defecto) o `user`
- `limit`: Número de resultados (1-100, por defecto 50)
- `token`: Requerido si `type=user`

**Ejemplos:**
- Ranking global: `/api/scores.php?type=global&limit=20`
- Puntuaciones del usuario: `/api/scores.php?type=user&token=tu_token&limit=10`

**Respuesta (global):**
```json
{
  "success": true,
  "message": "Ranking global",
  "data": {
    "scores": [...],
    "top_users": [...]
  }
}
```

**Respuesta (user):**
```json
{
  "success": true,
  "message": "Puntuaciones del usuario",
  "data": {
    "scores": [...],
    "stats": {
      "total_intentos": 5,
      "total_sumas": 150,
      "total_correctas": 120,
      "total_erroneas": 30,
      "tiempo_promedio": 95.5,
      "mejor_tiempo": 80,
      "mejor_puntuacion": 28
    }
  }
}
```

### GET/POST `/api/validate_token.php`
Valida si un token de sesión es válido.

**Parámetros:**
- `token`: Token de sesión (en query string o body JSON)

**Respuesta:**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario123"
    }
  }
}
```

## Seguridad

- Las contraseñas se almacenan con `password_hash()` (bcrypt)
- Los tokens de sesión expiran después de 24 horas
- Se limpian automáticamente las sesiones expiradas
- Validación de entrada en todos los endpoints
- Prepared statements para prevenir SQL injection

## Notas

- En producción, cambia `JWT_SECRET` en `config.php`
- Configura CORS apropiadamente según tu dominio
- Considera usar HTTPS en producción
- Los tokens se almacenan en la base de datos (sesiones)

