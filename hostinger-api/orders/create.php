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

    $items = $data['items'] ?? [];
    $shippingAddress = $data['shipping_address'] ?? null;
    $billingAddress = $data['billing_address'] ?? null;
    $paymentMethod = $data['payment_method'] ?? 'cod';
    $subtotal = (float)($data['subtotal'] ?? 0);
    $shippingCharge = (float)($data['shipping_charge'] ?? 0);
    $discountAmount = (float)($data['discount_amount'] ?? 0);
    $gstAmount = (float)($data['gst_amount'] ?? 0);
    $totalAmount = (float)($data['total_amount'] ?? 0);

    if (empty($items) || !$shippingAddress || $totalAmount <= 0) {
        sendError('Invalid order data', 400);
    }

    $conn = getDBConnection();

    $orderId = generateUUID();
    $shippingAddressJson = json_encode($shippingAddress);
    $billingAddressJson = json_encode($billingAddress);

    $stmt = $conn->prepare('
        INSERT INTO orders (id, user_id, total_amount, subtotal, shipping_charge, discount_amount, gst_amount,
                           status, payment_method, payment_status, shipping_address, billing_address,
                           created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $status = 'pending';
    $paymentStatus = 'pending';

    $stmt->bind_param(
        'ssdddddssss',
        $orderId, $payload['user_id'], $totalAmount, $subtotal, $shippingCharge, $discountAmount, $gstAmount,
        $status, $paymentMethod, $paymentStatus, $shippingAddressJson, $billingAddressJson
    );

    if (!$stmt->execute()) {
        throw new Exception('Database execute error: ' . $stmt->error);
    }

    $stmt->close();

    // Insert order items
    foreach ($items as $item) {
        $orderItemId = generateUUID();
        $productId = $item['product_id'] ?? '';
        $productName = $item['product_name'] ?? '';
        $quantity = (int)($item['quantity'] ?? 1);
        $price = (float)($item['price'] ?? 0);
        $gstAmount = (float)($item['gst_amount'] ?? 0);
        $gstPercentage = (float)($item['gst_percentage'] ?? 18);

        $stmt = $conn->prepare('
            INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price, gst_amount, gst_percentage, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ');

        $stmt->bind_param('ssssiddd', $orderItemId, $orderId, $productId, $productName, $quantity, $price, $gstAmount, $gstPercentage);
        $stmt->execute();
        $stmt->close();
    }

    // Add order tracking
    $trackingId = generateUUID();
    $stmt = $conn->prepare('
        INSERT INTO order_tracking (id, order_id, status, notes, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ');

    $stmt->bind_param('sss', $trackingId, $orderId, $status);
    $stmt->execute();
    $stmt->close();

    // Clear cart
    $stmt = $conn->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Order created successfully',
        'order' => [
            'id' => $orderId,
            'user_id' => $payload['user_id'],
            'total_amount' => $totalAmount,
            'status' => $status,
            'payment_method' => $paymentMethod,
            'payment_status' => $paymentStatus
        ]
    ], 201);

} catch (Exception $e) {
    logError('Create order error', ['message' => $e->getMessage()]);
    sendError('An error occurred while creating order', 500);
}
?>
