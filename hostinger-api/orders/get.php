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
    $orderId = $_GET['id'] ?? '';

    if (empty($orderId)) {
        sendError('Order ID is required', 400);
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare('
        SELECT id, user_id, total_amount, subtotal, shipping_charge, discount_amount, gst_amount,
               status, payment_method, payment_status, shipping_address, billing_address,
               razorpay_order_id, razorpay_payment_id, created_at, updated_at
        FROM orders
        WHERE id = ? AND user_id = ?
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('ss', $orderId, $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        sendError('Order not found', 404);
    }

    $order = $result->fetch_assoc();
    $stmt->close();

    // Get order items
    $stmt = $conn->prepare('
        SELECT id, product_id, product_name, quantity, price, gst_amount, gst_percentage, created_at
        FROM order_items
        WHERE order_id = ?
    ');

    $stmt->bind_param('s', $orderId);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    $stmt->close();
    $conn->close();

    $order['shipping_address'] = json_decode($order['shipping_address'], true);
    $order['billing_address'] = json_decode($order['billing_address'], true);

    sendResponse([
        'order' => $order,
        'items' => $items
    ]);

} catch (Exception $e) {
    logError('Get order error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching order', 500);
}
?>
