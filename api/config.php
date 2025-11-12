<?php
/**
 * Configuración de la base de datos
 * Ajusta estos valores según tu entorno
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'sumquiz');
define('DB_USER', 'root'); // Cambia por tu usuario de MySQL
define('DB_PASS', ''); // Cambia por tu contraseña de MySQL
define('DB_CHARSET', 'utf8mb4');

// Configuración de la aplicación
define('JWT_SECRET', 'tu_clave_secreta_cambiar_en_produccion'); // Cambia esto en producción
define('TOKEN_EXPIRY', 86400); // 24 horas en segundos

/**
 * Configurar headers CORS
 */
function setCorsHeaders() {
    // Permitir cualquier origen (en producción, especifica tu dominio)
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 3600');
    
    // Manejar preflight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    // Headers de respuesta
    header('Content-Type: application/json; charset=utf-8');
}

// Aplicar CORS inmediatamente
setCorsHeaders();

/**
 * Conexión a la base de datos
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos',
            'error' => $e->getMessage()
        ]);
        exit();
    }
}

/**
 * Respuesta JSON estándar
 */
function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Validar token de sesión (simple)
 */
function validateToken($token) {
    if (empty($token)) {
        return null;
    }
    
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("
        SELECT u.id, u.username 
        FROM usuarios u
        INNER JOIN sesiones s ON u.id = s.usuario_id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    
    return $user ?: null;
}

/**
 * Crear token de sesión
 */
function createSession($usuario_id) {
    $pdo = getDBConnection();
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', time() + TOKEN_EXPIRY);
    
    $stmt = $pdo->prepare("
        INSERT INTO sesiones (usuario_id, token, expires_at) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$usuario_id, $token, $expires_at]);
    
    return $token;
}

/**
 * Limpiar sesiones expiradas
 */
function cleanExpiredSessions() {
    $pdo = getDBConnection();
    $pdo->exec("DELETE FROM sesiones WHERE expires_at < NOW()");
}

/**
 * Verificar y otorgar logros
 */
function checkAndAwardAchievements($pdo, $usuario_id, $tipo_operacion, $correctas, $total_realizadas) {
    $logros = [];
    
    // Primera operación correcta
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM puntuaciones WHERE usuario_id = ? AND correctas > 0");
    $stmt->execute([$usuario_id]);
    $total_intentos = $stmt->fetch()['total'];
    if ($total_intentos == 1) {
        $logros[] = "primera_{$tipo_operacion}";
    }
    
    // Perfecto (todas correctas)
    if ($correctas == $total_realizadas && $total_realizadas >= 10) {
        $logros[] = "perfecto_{$tipo_operacion}";
    }
    
    // 30 correctas
    if ($correctas >= 30) {
        $logros[] = "maestro_{$tipo_operacion}";
    }
    
    // Racha de 5 perfectos
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as racha 
        FROM puntuaciones 
        WHERE usuario_id = ? 
        AND tipo_operacion = ? 
        AND correctas = total_realizadas 
        ORDER BY fecha DESC 
        LIMIT 5
    ");
    $stmt->execute([$usuario_id, $tipo_operacion]);
    $racha = $stmt->fetch()['racha'];
    if ($racha >= 5) {
        $logros[] = "racha_5_{$tipo_operacion}";
    }
    
    // Guardar logros
    foreach ($logros as $tipo_logro) {
        try {
            $stmt = $pdo->prepare("
                INSERT IGNORE INTO logros (usuario_id, tipo_logro) 
                VALUES (?, ?)
            ");
            $stmt->execute([$usuario_id, $tipo_logro]);
        } catch (PDOException $e) {
            // Ignorar errores de logros duplicados
        }
    }
    
    return $logros;
}

