<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$response = ['status' => 'error', 'message' => 'Invalid request'];

if ($method === 'GET' && $action === 'order_details') {
    session_start();
    if (!isset($_SESSION['csrf_token']) || !isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Invalid CSRF token']);
        exit;
    }

    $order_id = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    $guest_email = isset($_GET['guest_email']) ? $_GET['guest_email'] : null;

    if (!$order_id || (!$user_id && !$guest_email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Order ID and user ID or guest email required']);
        exit;
    }

    try {
        $query = "
            SELECT o.*, od.product_id, od.quantity, od.price_at_purchase, p.name,
                   op.promotion_id, op.applied_discount, pr.code
            FROM orders o
            LEFT JOIN order_details od ON o.order_id = od.order_id
            LEFT JOIN products p ON od.product_id = p.product_id
            LEFT JOIN order_promotions op ON o.order_id = op.order_id
            LEFT JOIN promotions pr ON op.promotion_id = pr.promotion_id
            WHERE o.order_id = ? AND (o.user_id = ? OR o.guest_email = ?)
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute([$order_id, $user_id, $guest_email]);
        $order_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$order_data) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Order not found']);
            exit;
        }

        $order = [
            'order_id' => $order_data[0]['order_id'],
            'order_code' => $order_data[0]['order_code'],
            'total_amount' => (float)$order_data[0]['total_amount'],
            'discount_amount' => (float)$order_data[0]['discount_amount'],
            'shipping_cost' => (float)$order_data[0]['shipping_cost'],
            'shipping_method' => $order_data[0]['shipping_method'],
            'payment_method' => $order_data[0]['payment_method'],
            'store_id' => $order_data[0]['store_id'],
            'shipping_address' => $order_data[0]['shipping_address'],
            'status' => $order_data[0]['status'],
            'created_at' => $order_data[0]['created_at'],
            'details' => [],
            'promotions' => []
        ];

        foreach ($order_data as $row) {
            if ($row['product_id']) {
                $order['details'][] = [
                    'detail_id' => "{$row['order_id']}_{$row['product_id']}",
                    'product_id' => $row['product_id'],
                    'name' => $row['name'],
                    'quantity' => (int)$row['quantity'],
                    'price_at_purchase' => (float)$row['price_at_purchase']
                ];
            }
            if ($row['promotion_id'] && !in_array($row['promotion_id'], array_column($order['promotions'], 'promotion_id'))) {
                $order['promotions'][] = [
                    'promotion_id' => $row['promotion_id'],
                    'code' => $row['code'],
                    'applied_discount' => (float)$row['applied_discount']
                ];
            }
        }

        $response = ['status' => 'success', 'data' => $order];
        http_response_code(200);
    } catch (PDOException $e) {
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
    echo json_encode($response);
    exit;
}

http_response_code(400);
echo json_encode($response);
?>