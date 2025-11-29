<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $conn = getDBConnection();

    $query = '
        SELECT p.id, p.name, p.description, p.price, p.original_price, p.image_url,
               p.category_id, c.name as category_name, p.in_stock, p.stock_quantity,
               p.rating, p.reviews_count, p.features, p.ingredients,
               p.gst_percentage, p.hsn_code, p.price_inclusive_of_tax, p.default_delivery_days,
               p.created_at, p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC
    ';

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception('Database query error: ' . $conn->error);
    }

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $row['features'] = json_decode($row['features'], true) ?? [];
        $row['ingredients'] = json_decode($row['ingredients'], true) ?? [];
        $row['in_stock'] = (bool)$row['in_stock'];
        $row['price_inclusive_of_tax'] = (bool)$row['price_inclusive_of_tax'];
        $products[] = $row;
    }

    $conn->close();

    sendResponse([
        'products' => $products,
        'total' => count($products)
    ]);

} catch (Exception $e) {
    logError('List products error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching products', 500);
}
?>
