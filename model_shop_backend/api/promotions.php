<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();
// Tạo CSRF token nếu chưa tồn tại
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Invalid CSRF token']);
    exit;
}

$response = ['status' => 'error', 'message' => 'Invalid request'];

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data['code'])) {
    $promoCode = $data['code'];
    $totalAmount = $data['total_amount'] ?? 0;
    $userId = $data['user_id'] ?? null;
    $guestEmail = $data['guest_email'] ?? null;

    // Logic kiểm tra mã khuyến mãi
    if ($promoCode === 'DISCOUNT10' && $totalAmount > 100) {
        $response = [
            'status' => 'success',
            'discount' => 10.0, // Giảm 10 USD
            'promotion_id' => 1
        ];
        http_response_code(200);
    } else {
        $response['message'] = 'Invalid promo code';
        http_response_code(400);
    }
} else {
    http_response_code(400);
}

echo json_encode($response);
?>