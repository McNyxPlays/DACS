<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    session_start();
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Invalid CSRF token']);
        exit;
    }
}

// Get CSRF token
if ($method === 'GET' && $action === 'csrf_token') {
    session_start();
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    $response = [
        'status' => 'success',
        'csrf_token' => $_SESSION['csrf_token']
    ];
    http_response_code(200);
    echo json_encode($response);
    exit;
}

// Get stores
if ($method === 'GET' && $action === 'stores') {
    try {
        $stmt = $conn->prepare("
            SELECT store_id, name, address
            FROM stores
            WHERE is_active = TRUE
            ORDER BY name ASC
        ");
        $stmt->execute();
        $stores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response = ['status' => 'success', 'data' => $stores];
        http_response_code(200);
    } catch (PDOException $e) {
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
    echo json_encode($response);
    exit;
}

// Create order
if ($method === 'POST' && $action === '') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
        exit;
    }

    try {
        $conn->beginTransaction();

        $order_code = 'ORD-' . strtoupper(uniqid());

        $user_id = isset($data['user_id']) && !empty($data['user_id']) ? (int)$data['user_id'] : null;
        $guest_email = isset($data['guest_email']) && !empty($data['guest_email']) ? $data['guest_email'] : null;
        $guest_phone = isset($data['guest_phone']) && !empty($data['guest_phone']) ? $data['guest_phone'] : null;
        $total_amount = (float)($data['total_amount'] ?? 0);
        $discount_amount = (float)($data['discount_amount'] ?? 0);
        $shipping_address = $data['shipping_address'] ?? null;
        $shipping_method = $data['shipping_method'] ?? 'standard';
        $shipping_cost = (float)($data['shipping_cost'] ?? 0);
        $store_id = isset($data['store_id']) && !empty($data['store_id']) ? (int)$data['store_id'] : null;
        $payment_method = $data['payment_method'] ?? 'cod';
        $promotion_id = isset($data['promotion_id']) && !empty($data['promotion_id']) ? (int)$data['promotion_id'] : null;

        if (!$user_id && !$guest_email && !$guest_phone) {
            throw new Exception('User ID, guest email, or guest phone must be provided');
        }
        if (empty($data['order_details']) || !is_array($data['order_details'])) {
            throw new Exception('Order details are required');
        }

        $stmt = $conn->prepare("
            INSERT INTO orders (
                user_id, guest_email, guest_phone, total_amount, discount_amount,
                status, order_code, shipping_address, shipping_method, shipping_cost,
                store_id, payment_method, is_paid, created_at
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, FALSE, NOW())
        ");
        $stmt->execute([
            $user_id, $guest_email, $guest_phone, $total_amount, $discount_amount,
            $order_code, $shipping_address, $shipping_method, $shipping_cost,
            $store_id, $payment_method
        ]);
        $order_id = $conn->lastInsertId();

        $stmt = $conn->prepare("
            INSERT INTO order_details (order_id, product_id, quantity, price_at_purchase)
            VALUES (?, ?, ?, ?)
        ");
        foreach ($data['order_details'] as $detail) {
            $stmt->execute([
                $order_id,
                (int)$detail['product_id'],
                (int)$detail['quantity'],
                (float)$detail['price_at_purchase']
            ]);
        }

        if ($promotion_id) {
            $stmt = $conn->prepare("
                INSERT INTO order_promotions (order_id, promotion_id, applied_discount, applied_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$order_id, $promotion_id, $discount_amount]);
        }

        $stmt = $conn->prepare("
            INSERT INTO order_status_history (order_id, old_status, new_status, changed_at)
            VALUES (?, NULL, 'pending', NOW())
        ");
        $stmt->execute([$order_id]);

        if ($promotion_id) {
            $stmt = $conn->prepare("
                UPDATE promotions
                SET usage_count = usage_count + 1
                WHERE promotion_id = ?
            ");
            $stmt->execute([$promotion_id]);
        }

        $conn->commit();

        $stmt = $conn->prepare("
            SELECT o.*, od.product_id, od.quantity, od.price_at_purchase, p.name
            FROM orders o
            LEFT JOIN order_details od ON o.order_id = od.order_id
            LEFT JOIN products p ON od.product_id = p.product_id
            WHERE o.order_id = ?
        ");
        $stmt->execute([$order_id]);
        $order_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $order_details = [];
        foreach ($order_data as $row) {
            $order_details[] = [
                'detail_id' => "{$row['order_id']}_{$row['product_id']}",
                'product_id' => $row['product_id'],
                'name' => $row['name'],
                'quantity' => $row['quantity'],
                'price_at_purchase' => $row['price_at_purchase']
            ];
        }

        $response = [
            'status' => 'success',
            'data' => [
                'order_id' => $order_id,
                'order_code' => $order_code,
                'total_amount' => $total_amount,
                'discount_amount' => $discount_amount,
                'shipping_cost' => $shipping_cost,
                'shipping_method' => $shipping_method,
                'payment_method' => $payment_method,
                'store_id' => $store_id,
                'shipping_address' => $shipping_address,
                'details' => $order_details,
                'promotions' => $promotion_id ? [[
                    'promotion_id' => $promotion_id,
                    'code' => $data['promotions'][0]['code'] ?? null,
                    'applied_discount' => $discount_amount
                ]] : []
            ]
        ];
        http_response_code(201);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(400);
        $response = ['status' => 'error', 'message' => $e->getMessage()];
    }
    echo json_encode($response);
    exit;
}

// Get order status
if ($method === 'GET' && $action === 'status') {
    $order_code = $_GET['order_code'] ?? '';
    if (empty($order_code)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Order code is required']);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            SELECT o.*, COALESCE(h.new_status, o.status) AS current_status, COALESCE(h.changed_at, o.created_at) AS last_updated
            FROM orders o
            LEFT JOIN order_status_history h ON o.order_id = h.order_id
            WHERE o.order_code = ? AND (h.history_id = (SELECT MAX(history_id) FROM order_status_history WHERE order_id = o.order_id) OR h.history_id IS NULL)
        ");
        $stmt->execute([$order_code]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($order) {
            $response = [
                'status' => 'success',
                'data' => [
                    'order_code' => $order['order_code'],
                    'current_status' => $order['current_status'],
                    'last_updated' => $order['last_updated']
                ]
            ];
            http_response_code(200);
        } else {
            $response = ['status' => 'error', 'message' => 'Order not found'];
            http_response_code(404);
        }
    } catch (PDOException $e) {
        error_log("SQL Error: " . $e->getMessage());
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
    echo json_encode($response);
    exit;
}

// Get order invoice
if ($method === 'GET' && $action === 'invoice') {
    $order_code = $_GET['order_code'] ?? '';
    if (empty($order_code)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Order code is required']);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            SELECT o.*, od.product_id, od.quantity, od.price_at_purchase, p.name
            FROM orders o
            LEFT JOIN order_details od ON o.order_id = od.order_id
            LEFT JOIN products p ON od.product_id = p.product_id
            WHERE o.order_code = ?
        ");
        $stmt->execute([$order_code]);
        $order_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($order_data) {
            $order_details = [];
            foreach ($order_data as $row) {
                $order_details[] = [
                    'product_id' => $row['product_id'],
                    'name' => $row['name'],
                    'quantity' => $row['quantity'],
                    'price_at_purchase' => $row['price_at_purchase']
                ];
            }
            $response = [
                'status' => 'success',
                'data' => [
                    'order_code' => $order_data[0]['order_code'],
                    'total_amount' => $order_data[0]['total_amount'],
                    'discount_amount' => $order_data[0]['discount_amount'],
                    'shipping_cost' => $order_data[0]['shipping_cost'],
                    'details' => $order_details
                ]
            ];
            http_response_code(200);
        } else {
            $response = ['status' => 'error', 'message' => 'Order not found'];
            http_response_code(404);
        }
    } catch (PDOException $e) {
        error_log("SQL Error: " . $e->getMessage());
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
    echo json_encode($response);
    exit;
}

http_response_code(400);
echo json_encode($response);
?>