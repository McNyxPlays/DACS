<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/database.php';
require_once '../config/functions.php';

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

session_start();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
            if ($user_id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid user ID']);
                exit;
            }

            // Validate user_id against session if available
            if (isset($_SESSION['user_id']) && $user_id !== (int)$_SESSION['user_id']) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Session mismatch']);
                exit;
            }

            // Verify user exists
            $stmt = $conn->prepare("SELECT user_id FROM users WHERE user_id = ? AND is_active = TRUE");
            $stmt->execute([$user_id]);
            if (!$stmt->fetch()) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'User not found or inactive']);
                exit;
            }

            // Fetch favorites (save_type = 'favorite') for the user
            $stmt = $conn->prepare("
                SELECT usi.saved_id, p.product_id, p.name, p.price, pi.image_url
                FROM user_saved_items usi
                JOIN products p ON usi.product_id = p.product_id
                LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_main = 1
                WHERE usi.user_id = ? AND usi.save_type = 'favorite' AND usi.product_id IS NOT NULL
            ");
            $stmt->execute([$user_id]);
            $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($favorites as &$item) {
                if (isset($item['image_url'])) {
                    $item['image'] = $item['image_url'] ? '/Uploads/' . $item['image_url'] : '/placeholder.jpg';
                    unset($item['image_url']);
                } else {
                    $item['image'] = '/placeholder.jpg';
                }
            }
            echo json_encode(['status' => 'success', 'favorites' => $favorites]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
            $product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;

            if ($user_id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid user ID']);
                exit;
            }
            if ($product_id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid product ID']);
                exit;
            }

            // Validate session
            if (isset($_SESSION['user_id']) && $user_id !== (int)$_SESSION['user_id']) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Session mismatch']);
                exit;
            }

            // Verify user exists
            $stmt = $conn->prepare("SELECT user_id FROM users WHERE user_id = ? AND is_active = TRUE");
            $stmt->execute([$user_id]);
            if (!$stmt->fetch()) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'User not found or inactive']);
                exit;
            }

            // Verify product exists
            $stmt = $conn->prepare("SELECT product_id FROM products WHERE product_id = ?");
            $stmt->execute([$product_id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Product not found']);
                exit;
            }

            // Check if product is already in favorites
            $stmt = $conn->prepare("
                SELECT saved_id 
                FROM user_saved_items 
                WHERE user_id = ? AND product_id = ? AND save_type = 'favorite'
            ");
            $stmt->execute([$user_id, $product_id]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Product already in favorites']);
                exit;
            }

            // Insert new favorite
            $stmt = $conn->prepare("
                INSERT INTO user_saved_items (user_id, product_id, save_type) 
                VALUES (?, ?, 'favorite')
            ");
            $stmt->execute([$user_id, $product_id]);
            $saved_id = $conn->lastInsertId();
            echo json_encode(['status' => 'success', 'saved_id' => $saved_id]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $saved_id = isset($data['saved_id']) ? (int)$data['saved_id'] : 0;
            $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;

            if ($saved_id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid saved ID']);
                exit;
            }
            if ($user_id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid user ID']);
                exit;
            }

            // Validate session
            if (isset($_SESSION['user_id']) && $user_id !== (int)$_SESSION['user_id']) {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Session mismatch']);
                exit;
            }

            // Delete favorite
            $stmt = $conn->prepare("
                DELETE FROM user_saved_items 
                WHERE saved_id = ? AND user_id = ? AND save_type = 'favorite'
            ");
            $stmt->execute([$saved_id, $user_id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success']);
            } else {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid saved_id or user_id']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    log_error("Error in favorites.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}

$conn = null;
?>