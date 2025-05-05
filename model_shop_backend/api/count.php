<?php
require_once '../config/database.php';
require_once '../config/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    $conn = null;
    exit;
}

$user_id = $_SESSION['user_id'];
try {
    $stmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to check user role: ' . $e->getMessage()]);
    $conn = null;
    exit;
}

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized - Not an admin']);
    $conn = null;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Count total users
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
        $stmt->execute();
        $users_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Count total products
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM products");
        $stmt->execute();
        $products_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Count total categories
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM categories");
        $stmt->execute();
        $categories_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Count total brands
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM brands");
        $stmt->execute();
        $brands_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        echo json_encode([
            'status' => 'success',
            'data' => [
                'users' => $users_count,
                'products' => $products_count,
                'categories' => $categories_count,
                'brands' => $brands_count
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch counts: ' . $e->getMessage()]);
    }
}

$conn = null;
?>