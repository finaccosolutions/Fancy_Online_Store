<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $payload = verifyToken();
    $data = getRequestBody();

    if (!$data) {
        sendError('Invalid request body', 400);
    }

    $productId = $data['product_id'] ?? '';
    $quantity = (int)($data['quantity'] ?? 1);

    if (empty($productId) || $quantity < 1) {
        sendError('Missing or invalid fields: product_id, quantity', 400);
    }

    $conn = getDBConnection();

    // Check if product exists
    $stmt = $conn->prepare('SELECT id FROM products WHERE id = ?');
    $stmt->bind_param('s', $productId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        $stmt->close();
        $conn->close();
        sendError('Product not found', 404);
    }
    $stmt->close();

    // Check if item already in cart
    $stmt = $conn->prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?');
    $stmt->bind_param('ss', $payload['user_id'], $productId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $newQuantity = $row['quantity'] + $quantity;

        $stmt = $conn->prepare('UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?');
        $stmt->bind_param('is', $newQuantity, $row['id']);
        $stmt->execute();
        $stmt->close();
    } else {
        $cartId = generateUUID();

        $stmt = $conn->prepare('
            INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ');

        $stmt->bind_param('sssi', $cartId, $payload['user_id'], $productId, $quantity);
        $stmt->execute();
        $stmt->close();
    }

    $conn->close();

    sendResponse([
        'message' => 'Item added to cart successfully'
    ], 201);

} catch (Exception $e) {
    logError('Add to cart error', ['message' => $e->getMessage()]);
    sendError('An error occurred while adding to cart', 500);
}
?>
