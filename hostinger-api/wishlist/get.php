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

    $query = '
        SELECT w.id, w.product_id, w.created_at,
               p.id, p.name, p.price, p.image_url, p.category_id, cat.name as category_name
        FROM wishlist_items w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    ';

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $wishlistItems = [];
    while ($row = $result->fetch_assoc()) {
        $wishlistItems[] = [
            'id' => $row['id'],
            'product_id' => $row['product_id'],
            'created_at' => $row['created_at'],
            'product' => [
                'id' => $row['product_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'image_url' => $row['image_url'],
                'category_id' => $row['category_id'],
                'category_name' => $row['category_name']
            ]
        ];
    }

    $stmt->close();
    $conn->close();

    sendResponse([
        'wishlist_items' => $wishlistItems,
        'total' => count($wishlistItems)
    ]);

} catch (Exception $e) {
    logError('Get wishlist error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching wishlist', 500);
}
?>
