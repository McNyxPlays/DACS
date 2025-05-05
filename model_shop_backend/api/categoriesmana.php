<?php
require_once '../config/database.php';
require_once '../config/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
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
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        try {
            $stmt = $conn->prepare("SELECT category_id, name, description FROM categories WHERE category_id = ?");
            $stmt->execute([$id]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($category) {
                echo json_encode(['status' => 'success', 'data' => [$category]]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Category not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch category: ' . $e->getMessage()]);
        }
    } else {
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        try {
            $stmt = $conn->prepare("SELECT category_id, name, description FROM categories WHERE name LIKE ?");
            $stmt->execute([$search]);
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $categories]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch categories: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Name is required']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
        $stmt->execute([$name, $description]);
        echo json_encode(['status' => 'success', 'message' => 'Category added', 'category_id' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to add category: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';

    if (empty($name) || $id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE categories SET name = ?, description = ? WHERE category_id = ?");
        $stmt->execute([$name, $description, $id]);
        echo json_encode(['status' => 'success', 'message' => 'Category updated']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to update category: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid category ID']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM categories WHERE category_id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Category deleted']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete category: ' . $e->getMessage()]);
    }
}

$conn = null;
?>