<?php
// Headers CORS primero (antes de cualquier output)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Método no permitido', null, 405);
}

$pdo = getDBConnection();

// Parámetros opcionales
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
$limit = min(max($limit, 1), 100); // Entre 1 y 100

$type = $_GET['type'] ?? 'global'; // 'global' o 'user'
$tipo_operacion = $_GET['tipo_operacion'] ?? null; // Filtrar por tipo de operación

// Si es 'user', requiere token
if ($type === 'user') {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? null;
    
    if ($token) {
        $token = str_replace('Bearer ', '', $token);
    } else {
        $token = $_GET['token'] ?? null;
    }
    
    if (empty($token)) {
        sendResponse(false, 'Token de sesión requerido', null, 401);
    }
    
    $user = validateToken($token);
    if (!$user) {
        sendResponse(false, 'Sesión inválida o expirada', null, 401);
    }
    
    // Obtener puntuaciones del usuario
    $whereClause = "WHERE u.id = ?";
    $params = [$user['id']];
    
    if ($tipo_operacion) {
        $whereClause .= " AND p.tipo_operacion = ?";
        $params[] = $tipo_operacion;
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.tipo_operacion,
            p.modo_practica,
            p.tiempo_segundos,
            p.total_realizadas,
            p.correctas,
            p.erroneas,
            p.fecha,
            u.username
        FROM puntuaciones p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        $whereClause
        ORDER BY p.fecha DESC
        LIMIT ?
    ");
    $params[] = $limit;
    $stmt->execute($params);
    $scores = $stmt->fetchAll();
    
    // Estadísticas del usuario (por tipo de operación si se especifica)
    $statsWhere = "WHERE usuario_id = ?";
    $statsParams = [$user['id']];
    if ($tipo_operacion) {
        $statsWhere .= " AND tipo_operacion = ?";
        $statsParams[] = $tipo_operacion;
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_intentos,
            SUM(total_realizadas) as total_operaciones,
            SUM(correctas) as total_correctas,
            SUM(erroneas) as total_erroneas,
            AVG(tiempo_segundos) as tiempo_promedio,
            MIN(tiempo_segundos) as mejor_tiempo,
            MAX(correctas) as mejor_puntuacion
        FROM puntuaciones
        $statsWhere
    ");
    $stmt->execute($statsParams);
    $stats = $stmt->fetch();
    
    // Estadísticas por tipo de operación
    $stmt = $pdo->prepare("
        SELECT 
            tipo_operacion,
            COUNT(*) as intentos,
            SUM(correctas) as total_correctas,
            MAX(correctas) as mejor_puntuacion
        FROM puntuaciones
        WHERE usuario_id = ? AND modo_practica = 0
        GROUP BY tipo_operacion
    ");
    $stmt->execute([$user['id']]);
    $stats_por_tipo = $stmt->fetchAll();
    
    // Obtener logros del usuario
    $stmt = $pdo->prepare("
        SELECT tipo_logro, fecha 
        FROM logros 
        WHERE usuario_id = ? 
        ORDER BY fecha DESC
    ");
    $stmt->execute([$user['id']]);
    $logros = $stmt->fetchAll();
    
    sendResponse(true, 'Puntuaciones del usuario', [
        'scores' => $scores,
        'stats' => $stats,
        'stats_por_tipo' => $stats_por_tipo,
        'logros' => $logros
    ]);
    
} else {
    // Ranking global
    $whereClause = "WHERE p.modo_practica = 0";
    $params = [];
    
    if ($tipo_operacion) {
        $whereClause .= " AND p.tipo_operacion = ?";
        $params[] = $tipo_operacion;
    }
    
    $params[] = $limit;
    
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.tipo_operacion,
            p.tiempo_segundos,
            p.total_realizadas,
            p.correctas,
            p.erroneas,
            p.fecha,
            u.username
        FROM puntuaciones p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        $whereClause
        ORDER BY p.correctas DESC, p.tiempo_segundos ASC, p.fecha DESC
        LIMIT ?
    ");
    $stmt->execute($params);
    $scores = $stmt->fetchAll();
    
    // Top usuarios (por mejor puntuación)
    $topWhere = "WHERE p.modo_practica = 0";
    $topParams = [];
    if ($tipo_operacion) {
        $topWhere .= " AND p.tipo_operacion = ?";
        $topParams[] = $tipo_operacion;
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            u.username,
            MAX(p.correctas) as mejor_correctas,
            MIN(p.tiempo_segundos) as mejor_tiempo,
            COUNT(p.id) as total_intentos
        FROM usuarios u
        INNER JOIN puntuaciones p ON u.id = p.usuario_id
        $topWhere
        GROUP BY u.id, u.username
        HAVING mejor_correctas IS NOT NULL
        ORDER BY mejor_correctas DESC, mejor_tiempo ASC
        LIMIT 10
    ");
    $stmt->execute($topParams);
    $topUsers = $stmt->fetchAll();
    
    sendResponse(true, 'Ranking global', [
        'scores' => $scores,
        'top_users' => $topUsers
    ]);
}

