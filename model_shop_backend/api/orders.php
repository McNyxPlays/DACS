<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$response = ['status' => 'error', 'message' => 'Invalid request'];

if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    session_start();
    // Tạo CSRF token nếu chưa tồn tại
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
        throw new Exception('Invalid CSRF token', 403);
    }
}

// Thêm endpoint để lấy CSRF token (GET request)
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

// Xử lý các action khác (ví dụ: stores, create order, v.v.)
if ($method === 'GET' && $action === 'stores') {
    // Logic lấy danh sách cửa hàng
    $stores = [
        ['store_id' => 1, 'name' => 'Store 1', 'address' => '123 Main St'],
        ['store_id' => 2, 'name' => 'Store 2', 'address' => '456 Oak St'],
    ];
    $response = ['status' => 'success', 'data' => $stores];
    http_response_code(200);
    echo json_encode($response);
    exit;
}

if ($method === 'POST' && $action === '') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        // Logic tạo đơn hàng
        $response = ['status' => 'success', 'data' => ['order_id' => rand(1000, 9999)]];
        http_response_code(201);
    }
    echo json_encode($response);
    exit;
}

http_response_code(400);
echo json_encode($response);
?>