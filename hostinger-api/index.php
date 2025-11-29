<?php
require_once 'config/cors.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);

$response = [
    'status' => 'ok',
    'message' => 'Velora Tradings API',
    'version' => '1.0.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $method,
    'path' => $path,
    'endpoints' => [
        'authentication' => [
            'POST /auth/signup.php' => 'Register new user',
            'POST /auth/signin.php' => 'Login user',
            'GET /auth/get-user.php' => 'Get current user (requires auth)',
            'PUT /auth/update-profile.php' => 'Update user profile (requires auth)',
        ],
        'products' => [
            'GET /products/list.php' => 'Get all products',
            'GET /products/get.php?id={id}' => 'Get product details',
            'GET /products/categories.php' => 'Get all categories',
        ],
        'cart' => [
            'GET /cart/get.php' => 'Get user cart (requires auth)',
            'POST /cart/add.php' => 'Add item to cart (requires auth)',
            'PUT /cart/update.php' => 'Update cart item (requires auth)',
            'DELETE /cart/remove.php' => 'Remove from cart (requires auth)',
            'DELETE /cart/clear.php' => 'Clear cart (requires auth)',
        ],
        'wishlist' => [
            'GET /wishlist/get.php' => 'Get user wishlist (requires auth)',
            'POST /wishlist/add.php' => 'Add to wishlist (requires auth)',
            'DELETE /wishlist/remove.php' => 'Remove from wishlist (requires auth)',
        ],
        'addresses' => [
            'GET /addresses/list.php' => 'Get user addresses (requires auth)',
            'POST /addresses/create.php' => 'Create address (requires auth)',
            'PUT /addresses/update.php' => 'Update address (requires auth)',
            'DELETE /addresses/delete.php' => 'Delete address (requires auth)',
        ],
        'orders' => [
            'GET /orders/list.php' => 'Get user orders (requires auth)',
            'GET /orders/get.php?id={id}' => 'Get order details (requires auth)',
            'POST /orders/create.php' => 'Create order (requires auth)',
        ],
        'payment' => [
            'POST /payment/create-razorpay-order.php' => 'Create Razorpay order (requires auth)',
            'POST /payment/verify-razorpay-payment.php' => 'Verify payment (requires auth)',
        ],
        'settings' => [
            'GET /settings/get.php' => 'Get site settings',
        ],
    ]
];

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
