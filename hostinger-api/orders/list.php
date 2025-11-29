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
        SELECT id, user_id, total_amount, status, payment_status, payment_method, created_at, updated_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    $stmt->close();
    $conn->close();

    sendResponse([
        'orders' => $orders,
        'total' => count($orders)
    ]);

} catch (Exception $e) {
    logError('List orders error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching orders', 500);
}
?>
