# Instrucciones para Levantar el Servidor PHP

## Opción 1: Servidor PHP Built-in (Recomendado para desarrollo)

1. **Abre una terminal nueva** y navega a la carpeta `api`:
   ```bash
   cd api
   ```

2. **Inicia el servidor PHP** en el puerto 8080:
   ```bash
   php -S localhost:8080
   ```

3. **Verifica que el archivo `.env`** en la raíz del proyecto tenga:
   ```
   VITE_API_URL=http://localhost:8080
   ```

4. **Reinicia el servidor de Vite** (si está corriendo):
   - Detén el servidor (Ctrl+C)
   - Vuelve a ejecutar: `npm run dev`

5. **Prueba la conexión** visitando en tu navegador:
   ```
   http://localhost:8080/test.php
   ```
   
   Deberías ver un JSON con `"success": true`

## Opción 2: Apache/Nginx (Producción)

Si usas Apache o Nginx, asegúrate de:

1. Colocar la carpeta `api` en tu directorio web (ej: `htdocs/api` o `/var/www/html/api`)
2. Configurar el `.env` con:
   ```
   VITE_API_URL=http://localhost/api
   ```
3. Habilitar mod_rewrite en Apache si es necesario

## Solución de Problemas

### Error: "No 'Access-Control-Allow-Origin' header"
- Verifica que el servidor PHP esté corriendo
- Asegúrate de que la URL en `.env` coincida con el puerto del servidor PHP
- Reinicia Vite después de cambiar `.env`

### Error: "ERR_FAILED" o "net::ERR_CONNECTION_REFUSED"
- El servidor PHP no está corriendo o está en un puerto diferente
- Verifica que el puerto 8080 esté libre
- Prueba cambiar el puerto: `php -S localhost:8081`

### El servidor PHP no responde
- Verifica que PHP esté instalado: `php -v`
- Asegúrate de estar en la carpeta `api` al ejecutar el servidor
- Revisa que los archivos PHP no tengan errores de sintaxis

