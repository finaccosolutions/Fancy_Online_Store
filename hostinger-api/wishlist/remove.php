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
        $wishlistItemId = $data['wishlist_item_id'] ?? '';
    } else {
        $wishlistItemId = $_GET['id'] ?? '';
    }

    if (empty($wishlistItemId)) {
        sendError('Wishlist item ID is required', 400);
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ss', $wishlistItemId, $payload['user_id']);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Item removed from wishlist successfully'
    ]);

} catch (Exception $e) {
    logError('Remove from wishlist error', ['message' => $e->getMessage()]);
    sendError('An error occurred while removing from wishlist', 500);
}
?>
