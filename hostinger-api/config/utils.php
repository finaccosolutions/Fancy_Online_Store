<?php
// UUID Generation
function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Password hashing
function hashPassword($password) {
    return password_hash($password, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3
    ]);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Get request body
function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// Validate email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Get client IP
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

// Rate limiting helper (using file-based storage)
function checkRateLimit($identifier, $limit = 100, $window = 3600) {
    $rateDir = __DIR__ . '/../storage/rate_limit/';
    if (!is_dir($rateDir)) {
        mkdir($rateDir, 0755, true);
    }

    $file = $rateDir . md5($identifier) . '.json';
    $now = time();

    $data = [];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        $data['requests'] = array_filter($data['requests'], function($timestamp) use ($now, $window) {
            return $timestamp > ($now - $window);
        });
    }

    $data['requests'][] = $now;
    file_put_contents($file, json_encode($data));

    return count($data['requests']) <= $limit;
}

// Log error
function logError($message, $context = []) {
    $logDir = __DIR__ . '/../storage/logs/';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }

    $logFile = $logDir . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . ' - ' . $message;

    if (!empty($context)) {
        $logMessage .= ' - ' . json_encode($context);
    }

    file_put_contents($logFile, $logMessage . PHP_EOL, FILE_APPEND);
}
?>
