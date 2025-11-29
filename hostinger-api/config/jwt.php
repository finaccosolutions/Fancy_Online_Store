<?php
// JWT Helper Functions
class JWT {
    public static function encode($payload, $secret = JWT_SECRET, $algorithm = JWT_ALGORITHM) {
        $header = [
            'alg' => $algorithm,
            'typ' => 'JWT'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + (24 * 60 * 60); // 24 hours

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }

    public static function decode($token, $secret = JWT_SECRET) {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new Exception('Invalid token format');
        }

        $headerEncoded = $parts[0];
        $payloadEncoded = $parts[1];
        $signatureEncoded = $parts[2];

        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
        $expectedSignature = self::base64UrlEncode($signature);

        if (!hash_equals($signatureEncoded, $expectedSignature)) {
            throw new Exception('Invalid token signature');
        }

        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        if (!$payload) {
            throw new Exception('Invalid token payload');
        }

        if ($payload['exp'] < time()) {
            throw new Exception('Token expired');
        }

        return $payload;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}

// Get bearer token from Authorization header
function getBearerToken() {
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (empty($authorization)) {
        return null;
    }

    if (preg_match('/Bearer\s+(\S+)/', $authorization, $matches)) {
        return $matches[1];
    }

    return null;
}

// Verify and decode token
function verifyToken() {
    $token = getBearerToken();

    if (!$token) {
        sendError('Authorization token required', 401);
    }

    try {
        $payload = JWT::decode($token);
        return $payload;
    } catch (Exception $e) {
        sendError($e->getMessage(), 401);
    }
}
?>
