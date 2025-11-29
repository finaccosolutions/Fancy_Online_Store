<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $conn = getDBConnection();

    $result = $conn->query('SELECT `key`, value FROM site_settings');

    if (!$result) {
        throw new Exception('Database query error: ' . $conn->error);
    }

    $settings = [];
    while ($row = $result->fetch_assoc()) {
        $settings[$row['key']] = json_decode($row['value'], true);
    }

    $conn->close();

    sendResponse([
        'settings' => $settings
    ]);

} catch (Exception $e) {
    logError('Get settings error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching settings', 500);
}
?>
