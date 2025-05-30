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
                SELECT p.product_id, p.name, p.category_id, c.name as category_name, p.brand_id, b.name as brand_name, 
                       p.price, p.discount, p.description, p.status, p.stock_quantity
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                LEFT JOIN brands b ON p.brand_id = b.brand_id
                WHERE p.product_id = ?
            ");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($product) {
                $stmt = $conn->prepare("
                    SELECT image_id, image_url, is_main
                    FROM product_images
                    WHERE product_id = ?
                    ORDER BY is_main DESC, image_id ASC
                ");
                $stmt->execute([$id]);
                $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $product['images'] = $images;
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
        $brand_id = isset($_GET['brand_id']) ? intval($_GET['brand_id']) : 0;
        $status = isset($_GET['status']) ? $_GET['status'] : '';

        try {
            $query = "
                SELECT p.product_id, p.name, p.category_id, c.name as category_name, p.brand_id, b.name as brand_name, 
                       p.price, p.discount, p.description, p.status, p.stock_quantity
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                LEFT JOIN brands b ON p.brand_id = b.brand_id
                WHERE p.name LIKE ?
            ";
            $params = [$search];

            if ($category_id > 0) {
                $query .= " AND p.category_id = ?";
                $params[] = $category_id;
            }
            if ($brand_id > 0) {
                $query .= " AND p.brand_id = ?";
                $params[] = $brand_id;
            }
            if (!empty($status)) {
                $query .= " AND p.status = ?";
                $params[] = $status;
            }

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
    // Check if this is a PUT request masquerading as POST
    $method = isset($_POST['_method']) ? strtoupper($_POST['_method']) : 'POST';

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        $name = $_POST['name'] ?? '';
        $category_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : 0;
        $brand_id = isset($_POST['brand_id']) ? intval($_POST['brand_id']) : 0;
        $price = $_POST['price'] ?? '';
        $discount = isset($_POST['discount']) ? floatval($_POST['discount']) : 0;
        $stock_quantity = isset($_POST['stock_quantity']) ? intval($_POST['stock_quantity']) : 0;
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? 'new';
        $images = isset($_FILES['images']) ? $_FILES['images'] : null;
        $primary_image_index = isset($_POST['primary_image_index']) ? intval($_POST['primary_image_index']) : -1;

        if ($id <= 0 || empty($name) || $category_id <= 0 || $brand_id <= 0 || empty($price)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid input']);
            $conn = null;
            exit;
        }

        if (!in_array($status, ['new', 'used', 'custom', 'hot', 'available', 'sale'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            $conn = null;
            exit;
        }

        if ($discount < 0 || $discount > 100) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Discount must be between 0 and 100']);
            $conn = null;
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT product_id FROM products WHERE product_id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Product not found']);
                $conn = null;
                exit;
            }

            $stmt = $conn->prepare("SELECT category_id FROM categories WHERE category_id = ?");
            $stmt->execute([$category_id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid category']);
                $conn = null;
                exit;
            }

            $stmt = $conn->prepare("SELECT brand_id FROM brands WHERE brand_id = ?");
            $stmt->execute([$brand_id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid brand']);
                $conn = null;
                exit;
            }

            $stmt = $conn->prepare("
                UPDATE products
                SET name = ?, category_id = ?, brand_id = ?, price = ?, discount = ?, stock_quantity = ?, description = ?, status = ?
                WHERE product_id = ?
            ");
            $stmt->execute([$name, $category_id, $brand_id, $price, $discount, $stock_quantity, $description, $status, $id]);

            if ($images && $images['name'][0] !== '') {
                $upload_dir = '../Uploads/products/';
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }

                $stmt = $conn->prepare("UPDATE product_images SET is_main = 0 WHERE product_id = ?");
                $stmt->execute([$id]);

                foreach ($images['name'] as $key => $image_name) {
                    if ($images['error'][$key] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($image_name, PATHINFO_EXTENSION));
                        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif'])) {
                            continue;
                        }

                        $new_filename = uniqid() . '.' . $ext;
                        $destination = $upload_dir . $new_filename;
                        if (move_uploaded_file($images['tmp_name'][$key], $destination)) {
                            $is_main = ($key === $primary_image_index) ? 1 : 0;
                            $stmt = $conn->prepare("
                                INSERT INTO product_images (product_id, image_url, is_main)
                                VALUES (?, ?, ?)
                            ");
                            $stmt->execute([$id, $new_filename, $is_main]);
                        }
                    }
                }
            }

            echo json_encode(['success' => true, 'message' => 'Product updated']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update product: ' . $e->getMessage()]);
        }
    } else {
        // Regular POST for adding a new product
        $name = $_POST['name'] ?? '';
        $category_id = isset($_POST['category_id']) ? intval($_POST['category_id']) : 0;
        $brand_id = isset($_POST['brand_id']) ? intval($_POST['brand_id']) : 0;
        $price = $_POST['price'] ?? '';
        $discount = isset($_POST['discount']) ? floatval($_POST['discount']) : 0;
        $stock_quantity = isset($_POST['stock_quantity']) ? intval($_POST['stock_quantity']) : 0;
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? 'new';
        $images = isset($_FILES['images']) ? $_FILES['images'] : null;
        $primary_image_index = isset($_POST['primary_image_index']) ? intval($_POST['primary_image_index']) : -1;

        if (empty($name) || $category_id <= 0 || $brand_id <= 0 || empty($price)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name, category, brand, and price are required']);
            $conn = null;
            exit;
        }

        if (!in_array($status, ['new', 'used', 'custom', 'hot', 'available', 'sale'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            $conn = null;
            exit;
        }

        if ($discount < 0 || $discount > 100) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Discount must be between 0 and 100']);
            $conn = null;
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT category_id FROM categories WHERE category_id = ?");
            $stmt->execute([$category_id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid category']);
                $conn = null;
                exit;
            }

            $stmt = $conn->prepare("SELECT brand_id FROM brands WHERE brand_id = ?");
            $stmt->execute([$brand_id]);
            if ($stmt->rowCount() === 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid brand']);
                $conn = null;
                exit;
            }

            $stmt = $conn->prepare("
                INSERT INTO products (name, category_id, brand_id, price, discount, stock_quantity, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$name, $category_id, $brand_id, $price, $discount, $stock_quantity, $description, $status]);
            $product_id = $conn->lastInsertId();

            if ($images && $images['name'][0] !== '') {
                $upload_dir = '../Uploads/products/';
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }

                foreach ($images['name'] as $key => $image_name) {
                    if ($images['error'][$key] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($image_name, PATHINFO_EXTENSION));
                        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif'])) {
                            continue;
                        }

                        $new_filename = uniqid() . '.' . $ext;
                        $destination = $upload_dir . $new_filename;
                        if (move_uploaded_file($images['tmp_name'][$key], $destination)) {
                            $is_main = ($key === $primary_image_index) ? 1 : 0;
                            $stmt = $conn->prepare("
                                INSERT INTO product_images (product_id, image_url, is_main)
                                VALUES (?, ?, ?)
                            ");
                            $stmt->execute([$product_id, $new_filename, $is_main]);
                        }
                    }
                }
            }

            echo json_encode(['success' => true, 'message' => 'Product added', 'product_id' => $product_id]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to add product: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Handle JSON input for pure PUT requests
    $put_data = json_decode(file_get_contents("php://input"), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $name = $put_data['name'] ?? '';
    $category_id = isset($put_data['category_id']) ? intval($put_data['category_id']) : 0;
    $brand_id = isset($put_data['brand_id']) ? intval($put_data['brand_id']) : 0;
    $price = $put_data['price'] ?? '';
    $discount = isset($put_data['discount']) ? floatval($put_data['discount']) : 0;
    $stock_quantity = isset($put_data['stock_quantity']) ? intval($put_data['stock_quantity']) : 0;
    $description = $put_data['description'] ?? '';
    $status = $put_data['status'] ?? 'new';
    $primary_image_index = isset($put_data['primary_image_index']) ? intval($put_data['primary_image_index']) : -1;

    if ($id <= 0 || empty($name) || $category_id <= 0 || $brand_id <= 0 || empty($price)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        $conn = null;
        exit;
    }

    if (!in_array($status, ['new', 'used', 'custom', 'hot', 'available', 'sale'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid status']);
        $conn = null;
        exit;
    }

    if ($discount < 0 || $discount > 100) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Discount must be between 0 and 100']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT product_id FROM products WHERE product_id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Product not found']);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("SELECT category_id FROM categories WHERE category_id = ?");
        $stmt->execute([$category_id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid category']);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("SELECT brand_id FROM brands WHERE brand_id = ?");
        $stmt->execute([$brand_id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid brand']);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE products
            SET name = ?, category_id = ?, brand_id = ?, price = ?, discount = ?, stock_quantity = ?, description = ?, status = ?
            WHERE product_id = ?
        ");
        $stmt->execute([$name, $category_id, $brand_id, $price, $discount, $stock_quantity, $description, $status, $id]);

        // Note: File uploads are not handled in pure PUT requests in this case
        // If you need to handle file uploads, use the POST with _method=PUT approach

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