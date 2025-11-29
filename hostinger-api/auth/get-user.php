<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $payload = verifyToken();

    $conn = getDBConnection();

    $stmt = $conn->prepare('
        SELECT id, email, full_name, phone, is_admin, email_verified, created_at, updated_at
        FROM users
        WHERE id = ?
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        sendError('User not found', 404);
    }

    $user = $result->fetch_assoc();
    $stmt->close();
    $conn->close();

    sendResponse([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone'],
            'is_admin' => (bool)$user['is_admin'],
            'email_verified' => (bool)$user['email_verified'],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at']
        ]
    ]);

} catch (Exception $e) {
    logError('Get user error', ['message' => $e->getMessage()]);
    sendError('An error occurred', 500);
}
?>
