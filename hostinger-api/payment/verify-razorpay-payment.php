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

    $razorpayPaymentId = $data['razorpay_payment_id'] ?? '';
    $razorpayOrderId = $data['razorpay_order_id'] ?? '';
    $razorpaySignature = $data['razorpay_signature'] ?? '';
    $orderId = $data['order_id'] ?? '';

    if (empty($razorpayPaymentId) || empty($razorpayOrderId) || empty($razorpaySignature) || empty($orderId)) {
        sendError('Missing required payment fields', 400);
    }

    $conn = getDBConnection();

    // Get Razorpay secret
    $stmt = $conn->prepare('SELECT value FROM site_settings WHERE `key` = ?');
    $key = 'razorpay_key_secret';
    $stmt->bind_param('s', $key);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    $razorpayKeySecret = json_decode($row['value'], true);

    if (empty($razorpayKeySecret)) {
        $conn->close();
        sendError('Razorpay not configured', 500);
    }

    // Verify signature
    $signatureData = $razorpayOrderId . '|' . $razorpayPaymentId;
    $expectedSignature = hash_hmac('sha256', $signatureData, $razorpayKeySecret);

    if ($razorpaySignature !== $expectedSignature) {
        $conn->close();
        sendError('Invalid payment signature', 400);
    }

    // Update order
    $paymentStatus = 'paid';
    $status = 'confirmed';

    $stmt = $conn->prepare('
        UPDATE orders
        SET razorpay_payment_id = ?, razorpay_signature = ?, payment_status = ?, status = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('ssssss', $razorpayPaymentId, $razorpaySignature, $paymentStatus, $status, $orderId, $payload['user_id']);

    if (!$stmt->execute()) {
        throw new Exception('Database execute error: ' . $stmt->error);
    }

    $stmt->close();

    // Add tracking record
    $trackingId = generateUUID();
    $stmt = $conn->prepare('
        INSERT INTO order_tracking (id, order_id, status, notes, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ');

    $notes = 'Payment confirmed via Razorpay. Payment ID: ' . $razorpayPaymentId;
    $stmt->bind_param('ssss', $trackingId, $orderId, $status, $notes);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Payment verified successfully',
        'order' => [
            'id' => $orderId,
            'payment_status' => 'paid',
            'status' => 'confirmed'
        ]
    ]);

} catch (Exception $e) {
    logError('Verify payment error', ['message' => $e->getMessage()]);
    sendError('An error occurred while verifying payment', 500);
}
?>
