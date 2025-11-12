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

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método no permitido', null, 405);
}

// Obtener token del header o del body
$headers = getallheaders();
$token = $headers['Authorization'] ?? null;

if ($token) {
    $token = str_replace('Bearer ', '', $token);
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? null;
}

if (empty($token)) {
    sendResponse(false, 'Token de sesión requerido', null, 401);
}

// Validar token
$user = validateToken($token);
if (!$user) {
    sendResponse(false, 'Sesión inválida o expirada', null, 401);
}

// Obtener datos de la puntuación
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendResponse(false, 'Datos inválidos', null, 400);
}

$tiempo_segundos = intval($input['tiempo_segundos'] ?? 0);
$total_realizadas = intval($input['total_realizadas'] ?? 0);
$correctas = intval($input['correctas'] ?? 0);
$erroneas = intval($input['erroneas'] ?? 0);
$tipo_operacion = $input['tipo_operacion'] ?? 'suma';
$modo_practica = intval($input['modo_practica'] ?? 0);

// Validar tipo_operacion
$tipos_validos = ['suma', 'resta'];
if (!in_array($tipo_operacion, $tipos_validos)) {
    sendResponse(false, 'Tipo de operación inválido', null, 400);
}

// Validaciones
if ($tiempo_segundos < 0) {
    sendResponse(false, 'El tiempo no puede ser negativo', null, 400);
}

if ($total_realizadas < 0) {
    sendResponse(false, 'El total realizado no puede ser negativo', null, 400);
}

if ($correctas < 0 || $erroneas < 0) {
    sendResponse(false, 'Las respuestas correctas y erróneas no pueden ser negativas', null, 400);
}

if ($correctas + $erroneas > $total_realizadas) {
    sendResponse(false, 'La suma de correctas y erróneas no puede exceder el total realizado', null, 400);
}

// Guardar puntuación
$pdo = getDBConnection();

try {
    $stmt = $pdo->prepare("
        INSERT INTO puntuaciones 
        (usuario_id, tipo_operacion, modo_practica, tiempo_segundos, total_realizadas, correctas, erroneas) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $user['id'],
        $tipo_operacion,
        $modo_practica,
        $tiempo_segundos,
        $total_realizadas,
        $correctas,
        $erroneas
    ]);
    
    // Verificar y otorgar logros
    checkAndAwardAchievements($pdo, $user['id'], $tipo_operacion, $correctas, $total_realizadas);
    
    $score_id = $pdo->lastInsertId();
    
    sendResponse(true, 'Puntuación guardada exitosamente', [
        'score_id' => $score_id,
        'tiempo_segundos' => $tiempo_segundos,
        'total_realizadas' => $total_realizadas,
        'correctas' => $correctas,
        'erroneas' => $erroneas
    ], 201);
    
} catch (PDOException $e) {
    sendResponse(false, 'Error al guardar la puntuación', null, 500);
}

