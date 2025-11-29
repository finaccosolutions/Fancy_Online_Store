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

    $amount = (float)($data['amount'] ?? 0);
    $orderId = $data['order_id'] ?? '';

    if ($amount <= 0 || empty($orderId)) {
        sendError('Missing or invalid fields: amount, order_id', 400);
    }

    $conn = getDBConnection();

    // Get Razorpay credentials from settings
    $stmt = $conn->prepare('SELECT value FROM site_settings WHERE `key` IN (?, ?)');
    $key1 = 'razorpay_key_id';
    $key2 = 'razorpay_key_secret';
    $stmt->bind_param('ss', $key1, $key2);
    $stmt->execute();
    $result = $stmt->get_result();

    $razorpayKeyId = '';
    $razorpayKeySecret = '';

    while ($row = $result->fetch_assoc()) {
        if ($row['value'] === $key1) {
            $razorpayKeyId = json_decode($row['value'], true);
        } else {
            $razorpayKeySecret = json_decode($row['value'], true);
        }
    }

    $stmt->close();

    if (empty($razorpayKeyId) || empty($razorpayKeySecret)) {
        $conn->close();
        sendError('Razorpay not configured', 500);
    }

    $orderData = [
        'amount' => round($amount * 100),
        'currency' => 'INR',
        'receipt' => 'receipt_' . $orderId,
        'payment_capture' => 1
    ];

    $auth = base64_encode($razorpayKeyId . ':' . $razorpayKeySecret);

    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $auth
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        logError('Razorpay API error', ['response' => $response, 'code' => $httpCode]);
        $conn->close();
        sendError('Failed to create Razorpay order', 500);
    }

    $razorpayOrder = json_decode($response, true);

    // Update order with Razorpay order ID
    $stmt = $conn->prepare('UPDATE orders SET razorpay_order_id = ? WHERE id = ? AND user_id = ?');
    $stmt->bind_param('sss', $razorpayOrder['id'], $orderId, $payload['user_id']);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'order_id' => $razorpayOrder['id'],
        'amount' => $razorpayOrder['amount'],
        'currency' => $razorpayOrder['currency'],
        'key_id' => $razorpayKeyId
    ]);

} catch (Exception $e) {
    logError('Create Razorpay order error', ['message' => $e->getMessage()]);
    sendError('An error occurred while creating payment order', 500);
}
?>
