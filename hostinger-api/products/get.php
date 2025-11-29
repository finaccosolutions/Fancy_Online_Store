<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $productId = $_GET['id'] ?? '';

    if (empty($productId)) {
        sendError('Product ID is required', 400);
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare('
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.image_url,
               p.category_id, c.name as category_name, p.in_stock, p.stock_quantity,
               p.rating, p.reviews_count, p.features, p.ingredients,
               p.gst_percentage, p.hsn_code, p.price_inclusive_of_tax, p.default_delivery_days,
               p.created_at, p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $productId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        sendError('Product not found', 404);
    }

    $product = $result->fetch_assoc();
    $stmt->close();
    $conn->close();

    $product['features'] = json_decode($product['features'], true) ?? [];
    $product['ingredients'] = json_decode($product['ingredients'], true) ?? [];
    $product['in_stock'] = (bool)$product['in_stock'];
    $product['price_inclusive_of_tax'] = (bool)$product['price_inclusive_of_tax'];

    sendResponse([
        'product' => $product
    ]);

} catch (Exception $e) {
    logError('Get product error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching product', 500);
}
?>
