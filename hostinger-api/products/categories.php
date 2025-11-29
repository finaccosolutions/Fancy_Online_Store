<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $conn = getDBConnection();

    $result = $conn->query('SELECT id, name FROM categories ORDER BY name ASC');

    if (!$result) {
        throw new Exception('Database query error: ' . $conn->error);
    }

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    $conn->close();

    sendResponse([
        'categories' => $categories,
        'total' => count($categories)
    ]);

} catch (Exception $e) {
    logError('List categories error', ['message' => $e->getMessage()]);
    sendError('An error occurred while fetching categories', 500);
}
?>
