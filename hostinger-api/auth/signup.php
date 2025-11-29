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
    $fullName = sanitizeInput($data['full_name'] ?? '');
    $phone = sanitizeInput($data['phone'] ?? '');

    if (empty($email) || empty($password) || empty($fullName)) {
        sendError('Missing required fields: email, password, full_name', 400);
    }

    if (!isValidEmail($email)) {
        sendError('Invalid email address', 400);
    }

    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters', 400);
    }

    // Rate limiting
    if (!checkRateLimit('signup_' . getClientIP(), 5, 3600)) {
        sendError('Too many signup attempts. Please try again later.', 429);
    }

    $conn = getDBConnection();

    // Check if email already exists
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt->close();
        $conn->close();
        sendError('Email already registered', 400);
    }
    $stmt->close();

    $userId = generateUUID();
    $hashedPassword = hashPassword($password);

    $stmt = $conn->prepare('
        INSERT INTO users (id, email, password, full_name, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('sssss', $userId, $email, $hashedPassword, $fullName, $phone);

    if (!$stmt->execute()) {
        throw new Exception('Database execute error: ' . $stmt->error);
    }

    $stmt->close();

    $token = JWT::encode([
        'user_id' => $userId,
        'email' => $email,
        'is_admin' => false
    ]);

    $conn->close();

    sendResponse([
        'message' => 'User registered successfully',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'full_name' => $fullName,
            'phone' => $phone,
            'is_admin' => false
        ],
        'session' => [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => 86400
        ]
    ], 201);

} catch (Exception $e) {
    logError('Signup error', ['message' => $e->getMessage()]);
    sendError('An error occurred during signup', 500);
}
?>
