<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $data = getRequestBody();

    if (!$data) {
        sendError('Invalid request body', 400);
    }

    $email = sanitizeInput($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError('Missing required fields: email, password', 400);
    }

    // Rate limiting
    if (!checkRateLimit('signin_' . getClientIP(), 10, 3600)) {
        sendError('Too many login attempts. Please try again later.', 429);
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare('
        SELECT id, email, password, full_name, phone, is_admin
        FROM users
        WHERE email = ?
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        sendError('Invalid email or password', 401);
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    if (!verifyPassword($password, $user['password'])) {
        $conn->close();
        sendError('Invalid email or password', 401);
    }

    $token = JWT::encode([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'is_admin' => (bool)$user['is_admin']
    ]);

    $conn->close();

    sendResponse([
        'message' => 'User logged in successfully',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone'],
            'is_admin' => (bool)$user['is_admin']
        ],
        'session' => [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => 86400
        ]
    ]);

} catch (Exception $e) {
    logError('Signin error', ['message' => $e->getMessage()]);
    sendError('An error occurred during signin', 500);
}
?>
