<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $payload = verifyToken();
    $data = getRequestBody();

    if (!$data) {
        sendError('Invalid request body', 400);
    }

    $conn = getDBConnection();

    $updates = [];
    $params = [];
    $types = '';

    if (!empty($data['full_name'])) {
        $updates[] = 'full_name = ?';
        $params[] = sanitizeInput($data['full_name']);
        $types .= 's';
    }

    if (!empty($data['phone'])) {
        $updates[] = 'phone = ?';
        $params[] = sanitizeInput($data['phone']);
        $types .= 's';
    }

    if (empty($updates)) {
        $conn->close();
        sendError('No fields to update', 400);
    }

    $updates[] = 'updated_at = NOW()';
    $params[] = $payload['user_id'];
    $types .= 's';

    $query = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception('Database execute error: ' . $stmt->error);
    }

    $stmt->close();

    $stmt = $conn->prepare('
        SELECT id, email, full_name, phone, is_admin, created_at, updated_at
        FROM users
        WHERE id = ?
    ');

    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    $conn->close();

    sendResponse([
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone'],
            'is_admin' => (bool)$user['is_admin'],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at']
        ]
    ]);

} catch (Exception $e) {
    logError('Update profile error', ['message' => $e->getMessage()]);
    sendError('An error occurred while updating profile', 500);
}
?>
