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
    if (!isset($input['code'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing promo code']);
        exit;
    }

    $code = $input['code'];

    try {
        $stmt = $conn->prepare("SELECT discount_value FROM promotions WHERE code = ? AND is_active = TRUE AND end_date > NOW()");
        $stmt->execute([$code]);
        $promotion = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($promotion) {
            echo json_encode(['status' => 'success', 'discount' => $promotion['discount_value']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired promo code']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
?>