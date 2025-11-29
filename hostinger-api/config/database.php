<?php
// Database Configuration for Hostinger MySQL
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'u443589701_velora_trading');
define('DB_USER', 'u443589701_velora_trading');
define('DB_PASS', 'Veloratrade@123');
define('DB_PORT', 3306);

// JWT Configuration
define('JWT_SECRET', 'your_jwt_secret_key_change_this_in_production');
define('JWT_ALGORITHM', 'HS256');

// API Configuration
define('API_URL', 'https://veloratradings.com/api');
define('FRONTEND_URL', 'https://veloratradings.com');

// Razorpay Configuration (will be fetched from database)
define('RAZORPAY_API_KEY', ''); // Set via admin panel
define('RAZORPAY_API_SECRET', ''); // Set via admin panel

// SMTP Configuration
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USER', ''); // Your Hostinger email
define('SMTP_PASS', ''); // Your Hostinger email password
define('SMTP_FROM_EMAIL', 'noreply@veloratradings.com');
define('SMTP_FROM_NAME', 'Velora Tradings');

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'https://veloratradings.com',
    'https://www.veloratradings.com',
    'http://localhost:5173', // Development
]);

// Create database connection
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

        if ($conn->connect_error) {
            throw new Exception('Database connection failed: ' . $conn->connect_error);
        }

        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed']));
    }
}

// Response helper
function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Error response helper
function sendError($message, $status = 400, $details = null) {
    $response = ['error' => $message];
    if ($details) {
        $response['details'] = $details;
    }
    sendResponse($response, $status);
}
?>
