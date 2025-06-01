<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once '../config/database.php';

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['code']) || empty(trim($input['code']))) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing or empty promo code']);
        exit;
    }

    $code = trim($input['code']);
    $total_amount = isset($input['total_amount']) ? floatval($input['total_amount']) : 0;

    try {
        $stmt = $conn->prepare("
            SELECT promotion_id, discount_percentage, min_order_value, max_discount_value
            FROM promotions
            WHERE code = ? AND is_active = TRUE
            AND start_date <= NOW() AND end_date >= NOW()
            AND min_order_value <= ?
        ");
        $stmt->execute([$code, $total_amount]);
        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($promotion) {
            $discount = $promotion['discount_percentage'] * $total_amount / 100;
            if ($promotion['max_discount_value'] > 0 && $discount > $promotion['max_discount_value']) {
                $discount = $promotion['max_discount_value'];
            }
            echo json_encode([
                'status' => 'success',
                'discount' => $discount,
                'promotion_id' => $promotion['promotion_id'],
                'code' => $code
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired promo code']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
?>