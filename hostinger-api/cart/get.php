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
        SELECT c.id, c.product_id, c.quantity, c.created_at, c.updated_at,
               p.id, p.name, p.price, p.original_price, p.image_url,
               p.category_id, cat.name as category_name, p.in_stock
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN categories cat ON p.category_id = cat.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    ';

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $cartItems = [];
    while ($row = $result->fetch_assoc()) {
        $cartItems[] = [
            'id' => $row['id'],
            'product_id' => $row['product_id'],
            'quantity' => (int)$row['quantity'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'product' => [
                'id' => $row['product_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'original_price' => $row['original_price'] ? (float)$row['original_price'] : null,
                'image_url' => $row['image_url'],
                'category_id' => $row['category_id'],
                'category_name' => $row['category_name'],
                'in_stock' => (bool)$row['in_stock']
            ]
        ];
    }

    $stmt->close();
    $conn->close();

    sendResponse([
        'cart_items' => $cartItems,
        'total' => count($cartItems)
    ]);

} catch (Exception $e) {
    logError('Get cart error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching cart', 500);
}
?>
