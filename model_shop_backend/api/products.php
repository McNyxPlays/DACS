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
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
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
    echo json_encode(['success' => false, 'error' => 'Failed to check user role: ' . $e->getMessage()]);
    $conn = null;
    exit;
}

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized - Not an admin']);
    $conn = null;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        try {
            $stmt = $conn->prepare("
                SELECT p.*, c.name AS category_name, 
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('image_id', pi.image_id, 'image_url', pi.image_url, 'is_main', pi.is_main))
                        FROM product_images pi WHERE pi.product_id = p.product_id) AS images
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.product_id = ?
            ");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($product) {
                $product['images'] = json_decode($product['images'], true) ?? [];
                echo json_encode(['success' => true, 'data' => [$product]]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Product not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to fetch product: ' . $e->getMessage()]);
        }
    } else {
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
        $status = isset($_GET['status']) ? $_GET['status'] : '';

        $query = "SELECT p.*, c.name AS category_name
                  FROM products p
                  LEFT JOIN categories c ON p.category_id = c.category_id
                  WHERE p.name LIKE ?";
        $params = [$search];

        if ($category_id > 0) {
            $query .= " AND p.category_id = ?";
            $params[] = $category_id;
        }

        if (!empty($status)) {
            $query .= " AND p.status = ?";
            $params[] = $status;
        }

        try {
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $products]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to fetch products: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $category_id = intval($_POST['category_id'] ?? 0);
    $price = floatval($_POST['price'] ?? 0);
    $description = $_POST['description'] ?? '';
    $status = $_POST['status'] ?? 'new';

    if (empty($name) || $category_id <= 0 || $price <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO products (name, category_id, price, description, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $category_id, $price, $description, $status]);
        $product_id = $conn->lastInsertId();

        if (!empty($_FILES['images']['name'][0])) {
            $upload_dir = '../Uploads/products/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
                $file_name = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                $file_path = $upload_dir . $file_name;
                if (move_uploaded_file($tmp_name, $file_path)) {
                    $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)");
                    $is_main = ($key === 0) ? 1 : 0;
                    $stmt->execute([$product_id, $file_name, $is_main]);
                }
            }
        }

        echo json_encode(['success' => true, 'message' => 'Product added', 'product_id' => $product_id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to add product: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $name = $_POST['name'] ?? '';
    $category_id = intval($_POST['category_id'] ?? 0);
    $price = floatval($_POST['price'] ?? 0);
    $description = $_POST['description'] ?? '';
    $status = $_POST['status'] ?? 'new';

    if (empty($name) || $category_id <= 0 || $price <= 0 || $id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE products SET name = ?, category_id = ?, price = ?, description = ?, status = ? WHERE product_id = ?");
        $stmt->execute([$name, $category_id, $price, $description, $status, $id]);

        if (!empty($_FILES['images']['name'][0])) {
            $upload_dir = '../Uploads/products/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
                $file_name = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                $file_path = $upload_dir . $file_name;
                if (move_uploaded_file($tmp_name, $file_path)) {
                    $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)");
                    $is_main = ($key === 0) ? 1 : 0;
                    $stmt->execute([$id, $file_name, $is_main]);
                }
            }
        }

        echo json_encode(['success' => true, 'message' => 'Product updated']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update product: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid product ID']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT image_url FROM product_images WHERE product_id = ?");
        $stmt->execute([$id]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($images as $image) {
            $file_path = '../Uploads/products/' . $image['image_url'];
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }

        $stmt = $conn->prepare("DELETE FROM product_images WHERE product_id = ?");
        $stmt->execute([$id]);

        $stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Product deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Product not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete product: ' . $e->getMessage()]);
    }
}

$conn = null;
?>