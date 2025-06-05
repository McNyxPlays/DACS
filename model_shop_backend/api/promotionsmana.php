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
            $stmt = $conn->prepare("
                SELECT p.promotion_id, p.name, p.code, p.discount_percentage, p.start_date, p.end_date, p.status,
                       p.usage_count, p.is_active
                FROM promotions p
                WHERE p.promotion_id = ?
            ");
            $stmt->execute([$id]);
            $promotion = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($promotion) {
                echo json_encode(['status' => 'success', 'data' => [$promotion]]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Promotion not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch promotion: ' . $e->getMessage()]);
        }
    } else {
        $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : '%';
        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        try {
            $query = "
                SELECT p.promotion_id, p.name, p.code, p.discount_percentage, p.start_date, p.end_date, p.status,
                       p.usage_count, p.is_active
                FROM promotions p
                WHERE (p.name LIKE ? OR p.code LIKE ?)
            ";
            $params = [$search, $search];

            if (!empty($status)) {
                $query .= " AND p.status = ?";
                $params[] = $status;
            }

            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $promotions]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch promotions: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';
    $code = $data['code'] ?? '';
    $discount_percentage = isset($data['discount_percentage']) ? floatval($data['discount_percentage']) : 0;
    $start_date = $data['start_date'] ?? '';
    $end_date = $data['end_date'] ?? '';
    $status = $data['status'] ?? 'active';
    $usage_count = isset($data['usage_count']) ? intval($data['usage_count']) : 0;
    $is_active = isset($data['is_active']) ? boolval($data['is_active']) : true;

    if (empty($name) || empty($code) || empty($start_date) || empty($end_date)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Name, code, start date, and end date are required']);
        $conn = null;
        exit;
    }

    if ($discount_percentage < 0 || $discount_percentage > 100) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Discount percentage must be between 0 and 100']);
        $conn = null;
        exit;
    }

    if ($usage_count < 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Usage count cannot be negative']);
        $conn = null;
        exit;
    }

    if (strtotime($end_date) <= strtotime($start_date)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'End date must be after start date']);
        $conn = null;
        exit;
    }

    if (!in_array($status, ['active', 'inactive', 'expired'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("
            INSERT INTO promotions (name, code, discount_percentage, start_date, end_date, status, usage_count, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $code, $discount_percentage, $start_date, $end_date, $status, $usage_count, $is_active]);
        $promotion_id = $conn->lastInsertId();
        echo json_encode(['status' => 'success', 'message' => 'Promotion added', 'promotion_id' => $promotion_id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to add promotion: ' . $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $name = $data['name'] ?? '';
    $code = $data['code'] ?? '';
    $discount_percentage = isset($data['discount_percentage']) ? floatval($data['discount_percentage']) : 0;
    $start_date = $data['start_date'] ?? '';
    $end_date = $data['end_date'] ?? '';
    $status = $data['status'] ?? 'active';
    $usage_count = isset($data['usage_count']) ? intval($data['usage_count']) : 0;
    $is_active = isset($data['is_active']) ? boolval($data['is_active']) : true;

    if ($id <= 0 || empty($name) || empty($code) || empty($start_date) || empty($end_date)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
        $conn = null;
        exit;
    }

    if ($discount_percentage < 0 || $discount_percentage > 100) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Discount percentage must be between 0 and 100']);
        $conn = null;
        exit;
    }

    if ($usage_count < 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Usage count cannot be negative']);
        $conn = null;
        exit;
    }

    if (strtotime($end_date) <= strtotime($start_date)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'End date must be after start date']);
        $conn = null;
        exit;
    }

    if (!in_array($status, ['active', 'inactive', 'expired'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT promotion_id FROM promotions WHERE promotion_id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Promotion not found']);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE promotions
            SET name = ?, code = ?, discount_percentage = ?, start_date = ?, end_date = ?, status = ?,
                usage_count = ?, is_active = ?
            WHERE promotion_id = ?
        ");
        $stmt->execute([$name, $code, $discount_percentage, $start_date, $end_date, $status, $usage_count, $is_active, $id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Promotion updated']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No changes made to promotion']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to update promotion: ' . $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid promotion ID']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM promotions WHERE promotion_id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Promotion deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Promotion not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete promotion: ' . $e->getMessage()]);
        exit;
    }
}

$conn = null;
?>