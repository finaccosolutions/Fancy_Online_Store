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

    $cartItemId = $data['cart_item_id'] ?? '';
    $quantity = (int)($data['quantity'] ?? 0);

    if (empty($cartItemId) || $quantity < 0) {
        sendError('Missing or invalid fields: cart_item_id, quantity', 400);
    }

    $conn = getDBConnection();

    if ($quantity === 0) {
        // Delete the item
        $stmt = $conn->prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?');
        $stmt->bind_param('ss', $cartItemId, $payload['user_id']);
        $stmt->execute();
        $stmt->close();
    } else {
        // Update quantity
        $stmt = $conn->prepare('UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?');
        $stmt->bind_param('iss', $quantity, $cartItemId, $payload['user_id']);
        $stmt->execute();
        $stmt->close();
    }

    $conn->close();

    sendResponse([
        'message' => 'Cart item updated successfully'
    ]);

} catch (Exception $e) {
    logError('Update cart error', ['message' => $e->getMessage()]);
    sendError('An error occurred while updating cart', 500);
}
?>
