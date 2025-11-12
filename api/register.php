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

if (strlen($username) < 3) {
    sendResponse(false, 'El nombre de usuario debe tener al menos 3 caracteres', null, 400);
}

if (strlen($username) > 50) {
    sendResponse(false, 'El nombre de usuario no puede exceder 50 caracteres', null, 400);
}

if (empty($password)) {
    sendResponse(false, 'La contraseña es requerida', null, 400);
}

if (strlen($password) < 4) {
    sendResponse(false, 'La contraseña debe tener al menos 4 caracteres', null, 400);
}

// Verificar si el usuario ya existe
$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE username = ?");
$stmt->execute([$username]);

if ($stmt->fetch()) {
    sendResponse(false, 'Este nombre de usuario ya está en uso', null, 409);
}

// Crear usuario
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO usuarios (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hashedPassword]);
    
    $usuario_id = $pdo->lastInsertId();
    
    // Crear sesión
    $token = createSession($usuario_id);
    
    sendResponse(true, 'Usuario registrado exitosamente', [
        'token' => $token,
        'user' => [
            'id' => $usuario_id,
            'username' => $username
        ]
    ], 201);
    
} catch (PDOException $e) {
    sendResponse(false, 'Error al registrar usuario', null, 500);
}

