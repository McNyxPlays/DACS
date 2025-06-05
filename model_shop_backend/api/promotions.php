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
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Invalid CSRF token']);
    exit;
}

require_once '../config/database.php';

$response = ['status' => 'error', 'message' => 'Invalid request'];

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data['code'])) {
    $promoCode = $data['code'];
    $totalAmount = $data['total_amount'] ?? 0;
    $userId = $data['user_id'] ?? null;
    $guestEmail = $data['guest_email'] ?? null;

    $conn = db_connect();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            SELECT promotion_id, discount_percentage, end_date
            FROM promotions
            WHERE code = ? AND status = 'active' AND is_active = TRUE
            AND (max_usage IS NULL OR usage_count < max_usage)
            AND (end_date IS NULL OR end_date > NOW())
        ");
        $stmt->execute([$promoCode]);
        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($promotion) {
            $discountPercentage = $promotion['discount_percentage'];
            $discountAmount = $totalAmount * ($discountPercentage / 100); // Không giới hạn bởi max_discount_value
            $response = [
                'status' => 'success',
                'discount' => $discountAmount,
                'promotion_id' => $promotion['promotion_id']
            ];
            http_response_code(200);

            // Update usage count
            $stmt = $conn->prepare("UPDATE promotions SET usage_count = usage_count + 1 WHERE promotion_id = ?");
            $stmt->execute([$promotion['promotion_id']]);
        } else {
            $response['message'] = 'Invalid promo code';
            http_response_code(400);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
} else {
    http_response_code(400);
}

echo json_encode($response);
?>