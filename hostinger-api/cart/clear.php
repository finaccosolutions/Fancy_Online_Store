<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $payload = verifyToken();

    $conn = getDBConnection();

    $stmt = $conn->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Cart cleared successfully'
    ]);

} catch (Exception $e) {
    logError('Clear cart error', ['message' => $e->getMessage()]);
    sendError('An error occurred while clearing cart', 500);
}
?>
