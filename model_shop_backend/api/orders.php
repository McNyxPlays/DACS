<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../config/functions.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    $conn = getDatabaseConnection();
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($method) {
        case 'POST':
            // Tạo đơn hàng mới
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid JSON data');
            }

            // Kiểm tra dữ liệu đầu vào
            $required_fields = ['total_amount', 'shipping_address', 'payment_method', 'order_details'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }

            // Xác định user_id hoặc guest
            $user_id = isset($data['user_id']) && $data['user_id'] ? (int)$data['user_id'] : null;
            $guest_email = isset($data['guest_email']) ? trim($data['guest_email']) : null;
            $guest_phone = isset($data['guest_phone']) ? trim($data['guest_phone']) : null;
            $total_amount = (float)$data['total_amount'];
            $discount_amount = isset($data['discount_amount']) ? (float)$data['discount_amount'] : 0.00;
            $shipping_address = trim($data['shipping_address']);
            $payment_method = $data['payment_method'];
            $order_details = $data['order_details'];

            // Kiểm tra tính hợp lệ của payment_method
            $valid_payment_methods = ['cod', 'bank_transfer', 'paypal'];
            if (!in_array($payment_method, $valid_payment_methods)) {
                throw new Exception('Invalid payment method');
            }

            // Kiểm tra order_details
            if (!is_array($order_details) || empty($order_details)) {
                throw new Exception('Order details must be a non-empty array');
            }

            foreach ($order_details as $detail) {
                if (!isset($detail['product_id'], $detail['quantity'], $detail['price_at_purchase'])) {
                    throw new Exception('Each order detail must have product_id, quantity, and price_at_purchase');
                }
                if ((int)$detail['quantity'] <= 0) {
                    throw new Exception('Quantity must be greater than 0');
                }
            }

            // Kiểm tra user_id hoặc thông tin guest
            if (!$user_id && !$guest_email && !$guest_phone) {
                throw new Exception('Either user_id, guest_email, or guest_phone must be provided');
            }

            // Tạo mã đơn hàng duy nhất
            $order_code = 'ORD-' . strtoupper(uniqid());
            
            // Bắt đầu giao dịch
            $conn->beginTransaction();

            // Thêm vào bảng orders
            $stmt = $conn->prepare("
                INSERT INTO orders (
                    user_id, guest_email, guest_phone, total_amount, discount_amount,
                    status, order_code, shipping_address, payment_method, created_at
                ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $user_id,
                $guest_email,
                $guest_phone,
                $total_amount,
                $discount_amount,
                $order_code,
                $shipping_address,
                $payment_method
            ]);
            $order_id = $conn->lastInsertId();

            // Thêm chi tiết đơn hàng vào bảng order_details
            $stmt = $conn->prepare("
                INSERT INTO order_details (order_id, product_id, quantity, price_at_purchase)
                VALUES (?, ?, ?, ?)
            ");
            foreach ($order_details as $detail) {
                $stmt->execute([
                    $order_id,
                    (int)$detail['product_id'],
                    (int)$detail['quantity'],
                    (float)$detail['price_at_purchase']
                ]);

                // Cập nhật số lượng tồn kho
                $conn->prepare("
                    UPDATE products
                    SET stock_quantity = stock_quantity - ?
                    WHERE product_id = ? AND stock_quantity >= ?
                ")->execute([(int)$detail['quantity'], (int)$detail['product_id'], (int)$detail['quantity']]);
            }

            // Ghi lịch sử trạng thái đơn hàng
            $stmt = $conn->prepare("
                INSERT INTO order_status_history (order_id, old_status, new_status, changed_at)
                VALUES (?, NULL, 'pending', NOW())
            ");
            $stmt->execute([$order_id]);

            // Áp dụng mã khuyến mãi (nếu có)
            if (isset($data['promo_code']) && $data['promo_code']) {
                $stmt = $conn->prepare("
                    SELECT promotion_id, discount_type, discount_value, max_discount_value
                    FROM promotions
                    WHERE code = ? AND is_active = 1
                    AND (start_date <= NOW() OR start_date IS NULL)
                    AND (end_date >= NOW() OR end_date IS NULL)
                    AND min_order_value <= ?
                ");
                $stmt->execute([$data['promo_code'], $total_amount]);
                $promo = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($promo) {
                    $applied_discount = $discount_amount; // Số tiền giảm giá đã được tính ở frontend
                    $stmt = $conn->prepare("
                        INSERT INTO order_promotions (order_id, promotion_id, applied_discount, applied_at)
                        VALUES (?, ?, ?, NOW())
                    ");
                    $stmt->execute([$order_id, $promo['promotion_id'], $applied_discount]);
                }
            }

            // Xác nhận giao dịch
            $conn->commit();

            // Trả về thông tin đơn hàng
            $response = [
                'status' => 'success',
                'data' => [
                    'order_id' => $order_id,
                    'order_code' => $order_code,
                    'total_amount' => $total_amount,
                    'discount_amount' => $discount_amount,
                    'shipping_address' => $shipping_address,
                    'payment_method' => $payment_method,
                    'created_at' => date('c')
                ]
            ];
            http_response_code(201);
            echo json_encode($response);
            break;

        case 'GET':
            // Lấy danh sách đơn hàng
            if (!isset($_GET['user_id']) && !isset($_GET['guest_email']) && !isset($_GET['guest_phone'])) {
                throw new Exception('User_id, guest_email, or guest_phone is required');
            }

            $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
            $guest_email = isset($_GET['guest_email']) ? trim($_GET['guest_email']) : null;
            $guest_phone = isset($_GET['guest_phone']) ? trim($_GET['guest_phone']) : null;

            $conditions = [];
            $params = [];
            if ($user_id) {
                $conditions[] = "user_id = ?";
                $params[] = $user_id;
            }
            if ($guest_email) {
                $conditions[] = "guest_email = ?";
                $params[] = $guest_email;
            }
            if ($guest_phone) {
                $conditions[] = "guest_phone = ?";
                $params[] = $guest_phone;
            }

            if (empty($conditions)) {
                throw new Exception('At least one identifier (user_id, guest_email, or guest_phone) is required');
            }

            $where_clause = implode(' AND ', $conditions);
            $stmt = $conn->prepare("
                SELECT order_id, user_id, guest_email, guest_phone, total_amount,
                       discount_amount, status, order_code, shipping_address,
                       payment_method, is_paid, paid_at, created_at
                FROM orders
                WHERE $where_clause
                ORDER BY created_at DESC
            ");
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($orders as &$order) {
                // Lấy chi tiết đơn hàng
                $stmt = $conn->prepare("
                    SELECT od.detail_id, od.product_id, od.quantity, od.price_at_purchase,
                           p.name, p.description,
                           (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1) as image_url
                    FROM order_details od
                    JOIN products p ON od.product_id = p.product_id
                    WHERE od.order_id = ?
                ");
                $stmt->execute([$order['order_id']]);
                $order['details'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($order['details'] as &$detail) {
                    $detail['image'] = $detail['image_url']
                        ? 'http://localhost:8080/Uploads/products/' . $detail['image_url']
                        : 'http://localhost:8080/placeholder.jpg';
                    unset($detail['image_url']);
                }

                // Lấy thông tin khuyến mãi (nếu có)
                $stmt = $conn->prepare("
                    SELECT p.code, op.applied_discount
                    FROM order_promotions op
                    JOIN promotions p ON op.promotion_id = p.promotion_id
                    WHERE op.order_id = ?
                ");
                $stmt->execute([$order['order_id']]);
                $order['promotions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            $response = [
                'status' => 'success',
                'data' => $orders
            ];
            http_response_code(200);
            echo json_encode($response);
            break;

        case 'PUT':
            // Cập nhật trạng thái đơn hàng (chỉ admin)
            session_start();
            if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
                throw new Exception('Unauthorized: Admin access required', 403);
            }

            if (!isset($_GET['order_id']) || !isset($_GET['new_status'])) {
                throw new Exception('Order_id and new_status are required');
            }

            $order_id = (int)$_GET['order_id'];
            $new_status = $_GET['new_status'];
            $valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!in_array($new_status, $valid_statuses)) {
                throw new Exception('Invalid status');
            }

            $stmt = $conn->prepare("SELECT status FROM orders WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$order) {
                throw new Exception('Order not found', 404);
            }
            $old_status = $order['status'];

            if ($old_status === $new_status) {
                throw new Exception('New status must be different from current status');
            }

            $conn->beginTransaction();

            // Cập nhật trạng thái
            $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
            $stmt->execute([$new_status, $order_id]);

            // Ghi lịch sử trạng thái
            $stmt = $conn->prepare("
                INSERT INTO order_status_history (order_id, old_status, new_status, changed_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$order_id, $old_status, $new_status]);

            $conn->commit();

            $response = [
                'status' => 'success',
                'message' => 'Order status updated successfully'
            ];
            http_response_code(200);
            echo json_encode($response);
            break;

        case 'DELETE':
            // Hủy đơn hàng (chỉ khi trạng thái là pending)
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['order_id'])) {
                throw new Exception('Order_id is required');
            }

            $order_id = (int)$data['order_id'];

            $stmt = $conn->prepare("SELECT status FROM orders WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$order) {
                throw new Exception('Order not found', 404);
            }

            if ($order['status'] !== 'pending') {
                throw new Exception('Only pending orders can be cancelled');
            }

            $conn->beginTransaction();

            // Cập nhật trạng thái thành cancelled
            $stmt = $conn->prepare("UPDATE orders SET status = 'cancelled' WHERE order_id = ?");
            $stmt->execute([$order_id]);

            // Ghi lịch sử trạng thái
            $stmt = $conn->prepare("
                INSERT INTO order_status_history (order_id, old_status, new_status, changed_at)
                VALUES (?, 'pending', 'cancelled', NOW())
            ");
            $stmt->execute([$order_id]);

            // Khôi phục số lượng tồn kho
            $stmt = $conn->prepare("SELECT product_id, quantity FROM order_details WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($details as $detail) {
                $conn->prepare("
                    UPDATE products
                    SET stock_quantity = stock_quantity + ?
                    WHERE product_id = ?
                ")->execute([(int)$detail['quantity'], (int)$detail['product_id']]);
            }

            $conn->commit();

            $response = [
                'status' => 'success',
                'message' => 'Order cancelled successfully'
            ];
            http_response_code(200);
            echo json_encode($response);
            break;

        default:
            throw new Exception('Method not allowed', 405);
    }

} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }

    $status_code = $e->getCode() ?: 500;
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    http_response_code($status_code);
    echo json_encode($response);
}

$conn = null;