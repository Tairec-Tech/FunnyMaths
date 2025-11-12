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

// Obtener token
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

// Validar token
$user = validateToken($token);
if (!$user) {
    sendResponse(false, 'Sesión inválida o expirada', null, 401);
}

$pdo = getDBConnection();

// Obtener logros del usuario
$stmt = $pdo->prepare("
    SELECT tipo_logro, fecha 
    FROM logros 
    WHERE usuario_id = ? 
    ORDER BY fecha DESC
");
$stmt->execute([$user['id']]);
$logros = $stmt->fetchAll();

// Definir descripciones de logros
$descripciones = [
    'primera_suma' => '🎉 ¡Primera suma correcta!',
    'primera_resta' => '🎉 ¡Primera resta correcta!',
    'perfecto_suma' => '⭐ Perfecto en sumas',
    'perfecto_resta' => '⭐ Perfecto en restas',
    'maestro_suma' => '👑 Maestro de sumas',
    'maestro_resta' => '👑 Maestro de restas',
    'racha_5_suma' => '🔥 Racha de 5 perfectos en sumas',
    'racha_5_resta' => '🔥 Racha de 5 perfectos en restas',
];

$logros_con_descripcion = array_map(function($logro) use ($descripciones) {
    return [
        'tipo' => $logro['tipo_logro'],
        'descripcion' => $descripciones[$logro['tipo_logro']] ?? $logro['tipo_logro'],
        'fecha' => $logro['fecha']
    ];
}, $logros);

sendResponse(true, 'Logros del usuario', [
    'logros' => $logros_con_descripcion,
    'total' => count($logros)
]);

