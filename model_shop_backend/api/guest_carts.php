<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

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
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
        exit;
    }

    $session_key = isset($input['session_key']) ? sanitize_input($input['session_key']) : null;
    $product_id = isset($input['product_id']) ? (int)$input['product_id'] : null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 1;

    if (!$session_key || !$product_id || $quantity <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing or invalid parameters']);
        exit;
    }

    try {
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

        $stmt = $conn->prepare("SELECT quantity FROM guest_carts WHERE session_key = ? AND product_id = ?");
        $stmt->execute([$session_key, $product_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existing) {
            $new_quantity = $existing['quantity'] + $quantity;
            if ($product['stock_quantity'] < $new_quantity) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Insufficient stock for updated quantity']);
                exit;
            }
            $stmt = $conn->prepare("UPDATE guest_carts SET quantity = ? WHERE session_key = ? AND product_id = ?");
            $stmt->execute([$new_quantity, $session_key, $product_id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO guest_carts (session_key, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$session_key, $product_id, $quantity]);
        }

        $stmt = $conn->prepare("
            SELECT gc.*, p.name, p.price, p.description,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1) as image_url
            FROM guest_carts gc 
            JOIN products p ON gc.product_id = p.product_id 
            WHERE gc.session_key = ?
        ");
        $stmt->execute([$session_key]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        log_error("Database error in guest_carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    } catch (Exception $e) {
        log_error("General error in guest_carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}

// Handle GET request (fetch cart)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $session_key = isset($_GET['session_key']) ? sanitize_input($_GET['session_key']) : null;
    if (!$session_key) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing session_key']);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            SELECT gc.*, p.name, p.price, p.description,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1) as image_url
            FROM guest_carts gc 
            JOIN products p ON gc.product_id = p.product_id 
            WHERE gc.session_key = ?
        ");
        $stmt->execute([$session_key]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        log_error("Database error in guest_carts.php: " . $e->getMessage());
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

    $session_key = isset($input['session_key']) ? sanitize_input($input['session_key']) : null;
    $guest_cart_id = isset($input['guest_cart_id']) ? (int)$input['guest_cart_id'] : null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : null;

    if (!$session_key || !$guest_cart_id || !$quantity || $quantity <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing or invalid parameters']);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT product_id FROM guest_carts WHERE guest_cart_id = ? AND session_key = ?");
        $stmt->execute([$guest_cart_id, $session_key]);
        $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cartItem) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid guest_cart_id or session_key']);
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

        $stmt = $conn->prepare("UPDATE guest_carts SET quantity = ? WHERE guest_cart_id = ? AND session_key = ?");
        $stmt->execute([$quantity, $guest_cart_id, $session_key]);
        echo json_encode(['status' => 'success', 'message' => 'Quantity updated']);
    } catch (PDOException $e) {
        log_error("Database error in guest_carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}

// Handle DELETE request (remove item or clear cart)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
        exit;
    }

    $session_key = isset($input['session_key']) ? sanitize_input($input['session_key']) : null;
    $guest_cart_id = isset($input['guest_cart_id']) ? (int)$input['guest_cart_id'] : null;

    if (!$session_key) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing session_key']);
        exit;
    }

    try {
        if ($guest_cart_id) {
            // Delete specific item
            $stmt = $conn->prepare("DELETE FROM guest_carts WHERE guest_cart_id = ? AND session_key = ?");
            $stmt->execute([$guest_cart_id, $session_key]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Item removed from cart']);
            } else {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid guest_cart_id or session_key']);
            }
        } else {
            // Clear all items for the session
            $stmt = $conn->prepare("DELETE FROM guest_carts WHERE session_key = ?");
            $stmt->execute([$session_key]);
            echo json_encode(['status' => 'success', 'message' => 'Guest cart cleared']);
        }
    } catch (PDOException $e) {
        log_error("Database error in guest_carts.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server error']);
    }
    exit;
}
?>