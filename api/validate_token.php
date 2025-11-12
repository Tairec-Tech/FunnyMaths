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

// Solo aceptar GET o POST
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    sendResponse(false, 'Método no permitido', null, 405);
}

// Obtener token
$headers = getallheaders();
$token = $headers['Authorization'] ?? null;

if ($token) {
    $token = str_replace('Bearer ', '', $token);
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? $_GET['token'] ?? null;
}

if (empty($token)) {
    sendResponse(false, 'Token requerido', null, 400);
}

// Validar token
$user = validateToken($token);

if ($user) {
    sendResponse(true, 'Token válido', [
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ]
    ]);
} else {
    sendResponse(false, 'Token inválido o expirado', null, 401);
}

