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

    if (empty($productId)) {
        sendError('Product ID is required', 400);
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

    // Check if already in wishlist
    $stmt = $conn->prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?');
    $stmt->bind_param('ss', $payload['user_id'], $productId);
    $stmt->execute();

    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        $conn->close();
        sendError('Product already in wishlist', 400);
    }
    $stmt->close();

    $wishlistId = generateUUID();

    $stmt = $conn->prepare('
        INSERT INTO wishlist_items (id, user_id, product_id, created_at)
        VALUES (?, ?, ?, NOW())
    ');

    $stmt->bind_param('sss', $wishlistId, $payload['user_id'], $productId);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Item added to wishlist successfully'
    ], 201);

} catch (Exception $e) {
    logError('Add to wishlist error', ['message' => $e->getMessage()]);
    sendError('An error occurred while adding to wishlist', 500);
}
?>
