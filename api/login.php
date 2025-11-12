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

// Obtener datos JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendResponse(false, 'Datos inválidos', null, 400);
}

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

// Validaciones
if (empty($username)) {
    sendResponse(false, 'El nombre de usuario es requerido', null, 400);
}

if (empty($password)) {
    sendResponse(false, 'La contraseña es requerida', null, 400);
}

// Buscar usuario
$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id, username, password FROM usuarios WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) {
    sendResponse(false, 'Usuario o contraseña incorrectos', null, 401);
}

// Verificar contraseña
if (!password_verify($password, $user['password'])) {
    sendResponse(false, 'Usuario o contraseña incorrectos', null, 401);
}

// Limpiar sesiones expiradas
cleanExpiredSessions();

// Crear nueva sesión
$token = createSession($user['id']);

sendResponse(true, 'Inicio de sesión exitoso', [
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'username' => $user['username']
    ]
]);

