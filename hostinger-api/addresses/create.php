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

    $title = sanitizeInput($data['title'] ?? '');
    $fullName = sanitizeInput($data['full_name'] ?? '');
    $phone = sanitizeInput($data['phone'] ?? '');
    $addressLine1 = sanitizeInput($data['address_line_1'] ?? '');
    $addressLine2 = sanitizeInput($data['address_line_2'] ?? '');
    $city = sanitizeInput($data['city'] ?? '');
    $state = sanitizeInput($data['state'] ?? '');
    $postalCode = sanitizeInput($data['postal_code'] ?? '');
    $country = sanitizeInput($data['country'] ?? 'India');
    $isDefault = (bool)($data['is_default'] ?? false);
    $isGstRegistered = (bool)($data['is_gst_registered'] ?? false);
    $gstin = sanitizeInput($data['gstin'] ?? '');
    $addressType = $data['address_type'] ?? 'delivery';

    if (empty($fullName) || empty($phone) || empty($addressLine1) || empty($city) || empty($state) || empty($postalCode)) {
        sendError('Missing required address fields', 400);
    }

    $conn = getDBConnection();

    // If setting as default, unset other defaults
    if ($isDefault) {
        $stmt = $conn->prepare('UPDATE addresses SET is_default = FALSE WHERE user_id = ?');
        $stmt->bind_param('s', $payload['user_id']);
        $stmt->execute();
        $stmt->close();
    }

    $addressId = generateUUID();

    $stmt = $conn->prepare('
        INSERT INTO addresses (id, user_id, title, full_name, phone, address_line_1, address_line_2,
                              city, state, postal_code, country, is_default, is_gst_registered, gstin,
                              address_type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ');

    if (!$stmt) {
        throw new Exception('Database prepare error: ' . $conn->error);
    }

    $stmt->bind_param(
        'sssssssssssisss',
        $addressId, $payload['user_id'], $title, $fullName, $phone, $addressLine1, $addressLine2,
        $city, $state, $postalCode, $country, $isDefault, $isGstRegistered, $gstin, $addressType
    );

    if (!$stmt->execute()) {
        throw new Exception('Database execute error: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    sendResponse([
        'message' => 'Address created successfully',
        'address' => [
            'id' => $addressId,
            'user_id' => $payload['user_id'],
            'title' => $title,
            'full_name' => $fullName,
            'phone' => $phone,
            'address_line_1' => $addressLine1,
            'address_line_2' => $addressLine2,
            'city' => $city,
            'state' => $state,
            'postal_code' => $postalCode,
            'country' => $country,
            'is_default' => $isDefault,
            'is_gst_registered' => $isGstRegistered,
            'gstin' => $gstin,
            'address_type' => $addressType
        ]
    ], 201);

} catch (Exception $e) {
    logError('Create address error', ['message' => $e->getMessage()]);
    sendError('An error occurred while creating address', 500);
}
?>
