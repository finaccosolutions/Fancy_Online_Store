<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $payload = verifyToken();
    $data = getRequestBody();

    if (!$data) {
        sendError('Invalid request body', 400);
    }

    $addressId = $data['id'] ?? '';

    if (empty($addressId)) {
        sendError('Address ID is required', 400);
    }

    $conn = getDBConnection();

    // Verify ownership
    $stmt = $conn->prepare('SELECT user_id FROM addresses WHERE id = ?');
    $stmt->bind_param('s', $addressId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0 || $result->fetch_assoc()['user_id'] !== $payload['user_id']) {
        $stmt->close();
        $conn->close();
        sendError('Address not found or unauthorized', 404);
    }
    $stmt->close();

    $updates = [];
    $params = [];
    $types = '';

    $fields = ['title', 'full_name', 'phone', 'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country', 'gstin'];

    foreach ($fields as $field) {
        if (isset($data[$field])) {
            $updates[] = '`' . $field . '` = ?';
            $params[] = sanitizeInput($data[$field]);
            $types .= 's';
        }
    }

    if (isset($data['is_default'])) {
        $isDefault = (bool)$data['is_default'];
        $updates[] = 'is_default = ?';
        $params[] = $isDefault;
        $types .= 'i';

        if ($isDefault) {
            $stmt = $conn->prepare('UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?');
            $stmt->bind_param('ss', $payload['user_id'], $addressId);
            $stmt->execute();
            $stmt->close();
        }
    }

    if (isset($data['is_gst_registered'])) {
        $isGstRegistered = (bool)$data['is_gst_registered'];
        $updates[] = 'is_gst_registered = ?';
        $params[] = $isGstRegistered;
        $types .= 'i';
    }

    if (isset($data['address_type'])) {
        $updates[] = 'address_type = ?';
        $params[] = $data['address_type'];
        $types .= 's';
    }

    if (empty($updates)) {
        $conn->close();
        sendError('No fields to update', 400);
    }

    $updates[] = 'updated_at = NOW()';
    $params[] = $addressId;
    $types .= 's';

    $query = 'UPDATE addresses SET ' . implode(', ', $updates) . ' WHERE id = ?';

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception('Database execute error: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    sendResponse([
        'message' => 'Address updated successfully'
    ]);

} catch (Exception $e) {
    logError('Update address error', ['message' => $e->getMessage()]);
    sendError('An error occurred while updating address', 500);
}
?>
