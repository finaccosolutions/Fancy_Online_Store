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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = getRequestBody();
        $cartItemId = $data['cart_item_id'] ?? '';
    } else {
        $cartItemId = $_GET['id'] ?? '';
    }

    if (empty($cartItemId)) {
        sendError('Cart item ID is required', 400);
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ss', $cartItemId, $payload['user_id']);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Item removed from cart successfully'
    ]);

} catch (Exception $e) {
    logError('Remove from cart error', ['message' => $e->getMessage()]);
    sendError('An error occurred while removing from cart', 500);
}
?>
