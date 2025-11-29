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

    $stmt = $conn->prepare('
        SELECT id, user_id, title, full_name, phone, address_line_1, address_line_2,
               city, state, postal_code, country, is_default, is_gst_registered, gstin,
               address_type, created_at, updated_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param('s', $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $addresses = [];
    while ($row = $result->fetch_assoc()) {
        $row['is_default'] = (bool)$row['is_default'];
        $row['is_gst_registered'] = (bool)$row['is_gst_registered'];
        $addresses[] = $row;
    }

    $stmt->close();
    $conn->close();

    sendResponse([
        'addresses' => $addresses,
        'total' => count($addresses)
    ]);

} catch (Exception $e) {
    logError('List addresses error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching addresses', 500);
}
?>
