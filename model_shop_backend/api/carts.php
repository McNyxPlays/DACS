<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once '../config/database.php';
require_once '../config/functions.php';

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Handle POST request (add to cart)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
        exit;
    }

    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : null;
    $product_id = isset($input['product_id']) ? (int)$input['product_id'] : null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 1;

    // Verify user_id matches the session
    if (!$user_id || $user_id !== $_SESSION['user_id']) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid user_id or session mismatch']);
        exit;
    }

    if (!$product_id || $quantity <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing or invalid parameters']);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid user_id']);
            exit;
        }

        $stmt = $conn->prepare("SELECT stock_quantity FROM products WHERE product_id = ?");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid product_id']);
            exit;
        }
        if ($product['stock_quantity'] < $quantity) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Insufficient stock']);
            exit;
        }

        $stmt = $conn->prepare("SELECT quantity FROM carts WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $product_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            $new_quantity = $existing['quantity'] + $quantity;
            if ($product['stock_quantity'] < $new_quantity) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Insufficient stock for updated quantity']);
                exit;
            }
            $stmt = $conn->prepare("UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$new_quantity, $user_id, $product_id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to update cart']);
                exit;
            }
        } else {
            $stmt = $conn->prepare("INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $product_id, $quantity]);
            if ($stmt->rowCount() === 0) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to add to cart']);
                exit;
            }
        }

        $stmt = $conn->prepare("
            SELECT c.*, p.name, p.price, p.description,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1) as image_url
            FROM carts c 
            JOIN products p ON c.product_id = p.product_id 
            WHERE c.user_id = ?
        ");
        $stmt->execute([$user_id]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Thêm tiền tố '/Uploads/' cho image_url nếu tồn tại
        foreach ($cartItems as &$item) {
            if (isset($item['image_url'])) {
                $item['image'] = $item['image_url'] ? '/Uploads/' . $item['image_url'] : '/placeholder.jpg';
                unset($item['image_url']);
            } else {
                $item['image'] = '/placeholder.jpg';
            }
        }
        echo json_encode(['status' => 'success', 'message' => 'Item added to cart', 'data' => $cartItems]);
    } catch (PDOException $e) {
        log_error("Database error in carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    } catch (Exception $e) {
        log_error("General error in carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}

// Handle GET request (fetch cart)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing user_id']);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            SELECT c.*, p.name, p.price, p.description,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1) as image_url
            FROM carts c 
            JOIN products p ON c.product_id = p.product_id 
            WHERE c.user_id = ?
        ");
        $stmt->execute([$user_id]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Thêm tiền tố '/Uploads/' cho image_url nếu tồn tại
        foreach ($cartItems as &$item) {
            if (isset($item['image_url'])) {
                $item['image'] = $item['image_url'] ? '/Uploads/' . $item['image_url'] : '/placeholder.jpg';
                unset($item['image_url']);
            } else {
                $item['image'] = '/placeholder.jpg';
            }
        }
        echo json_encode(['status' => 'success', 'data' => $cartItems]);
    } catch (PDOException $e) {
        log_error("Database error in carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}

// Handle PUT request (update quantity)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
        exit;
    }

    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : null;
    $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : null;

    if (!$user_id || !$cart_id || !$quantity || $quantity <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing or invalid parameters']);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT product_id FROM carts WHERE cart_id = ? AND user_id = ?");
        $stmt->execute([$cart_id, $user_id]);
        $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cartItem) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid cart_id or user_id']);
            exit;
        }

        $stmt = $conn->prepare("SELECT stock_quantity FROM products WHERE product_id = ?");
        $stmt->execute([$cartItem['product_id']]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($product['stock_quantity'] < $quantity) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Insufficient stock']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE carts SET quantity = ? WHERE cart_id = ? AND user_id = ?");
        $stmt->execute([$quantity, $cart_id, $user_id]);
        echo json_encode(['status' => 'success', 'message' => 'Quantity updated']);
    } catch (PDOException $e) {
        log_error("Database error in carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}

// Handle DELETE request (remove item or all)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
        exit;
    }

    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : null;
    $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : null;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing user_id']);
        exit;
    }

    try {
        if ($cart_id) {
            // Xóa một mục cụ thể
            $stmt = $conn->prepare("DELETE FROM carts WHERE cart_id = ? AND user_id = ?");
            $stmt->execute([$cart_id, $user_id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Item removed from cart']);
            } else {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid cart_id or user_id']);
            }
        } else {
            // Xóa tất cả các mục của user
            $stmt = $conn->prepare("DELETE FROM carts WHERE user_id = ?");
            $stmt->execute([$user_id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'All items removed from cart']);
            } else {
                echo json_encode(['status' => 'success', 'message' => 'Cart is already empty']);
            }
        }
    } catch (PDOException $e) {
        log_error("Database error in carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}
?>