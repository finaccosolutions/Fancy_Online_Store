<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/jwt.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $payload = verifyToken();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = getRequestBody();
        $addressId = $data['id'] ?? '';
    } else {
        $addressId = $_GET['id'] ?? '';
    }

    if (empty($addressId)) {
        sendError('Address ID is required', 400);
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ss', $addressId, $payload['user_id']);
    $stmt->execute();
    $stmt->close();

    $conn->close();

    sendResponse([
        'message' => 'Address deleted successfully'
    ]);

} catch (Exception $e) {
    logError('Delete address error', ['message' => $e->getMessage()]);
    sendError('An error occurred while deleting address', 500);
}
?>
