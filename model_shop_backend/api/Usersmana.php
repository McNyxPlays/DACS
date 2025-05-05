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
    $response = ['status' => 'error', 'message' => 'Database connection failed', 'data' => []];
    echo json_encode($response);
    exit;
}

session_start();

// Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    $response = ['status' => 'error', 'message' => 'Unauthorized - No session', 'data' => []];
    echo json_encode($response);
    $conn = null;
    exit;
}

// Kiểm tra quyền admin
$user_id = $_SESSION['user_id'];
try {
    $stmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    $response = ['status' => 'error', 'message' => 'Failed to check user role: ' . $e->getMessage(), 'data' => []];
    echo json_encode($response);
    $conn = null;
    exit;
}

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    $response = ['status' => 'error', 'message' => 'Unauthorized - Not an admin', 'data' => []];
    echo json_encode($response);
    $conn = null;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        try {
            $stmt = $conn->prepare("SELECT user_id, email, phone_number, address, role, full_name, gender, profile_image, is_active, created_at FROM users WHERE user_id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                echo json_encode(['status' => 'success', 'message' => 'User fetched successfully', 'data' => [$user]]);
            } else {
                http_response_code(404);
                $response = ['status' => 'error', 'message' => 'User not found', 'data' => []];
                echo json_encode($response);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            $response = ['status' => 'error', 'message' => 'Failed to fetch user: ' . $e->getMessage(), 'data' => []];
            echo json_encode($response);
        }
    } else {
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        $is_active = isset($_GET['is_active']) ? intval($_GET['is_active']) : -1;

        $query = "SELECT user_id, email, phone_number, address, role, full_name, gender, profile_image, is_active, created_at FROM users WHERE email LIKE ? OR phone_number LIKE ?";
        $params = [$search, $search];

        if ($is_active >= 0) {
            $query .= " AND is_active = ?";
            $params[] = $is_active;
        }

        try {
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'message' => 'Users fetched successfully', 'data' => $users]);
        } catch (PDOException $e) {
            http_response_code(500);
            $response = ['status' => 'error', 'message' => 'Database query failed: ' . $e->getMessage(), 'data' => []];
            echo json_encode($response);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
    $phone_number = $data['phone_number'] ?? null;
    $address = $data['address'] ?? null;
    $role = $data['role'] ?? 'user';
    $full_name = $data['full_name'] ?? null;
    $gender = $data['gender'] ?? null;
    $profile_image = $data['profile_image'] ?? null;
    $is_active = isset($data['is_active']) ? 1 : 0;

    if (empty($email) || empty($data['password'])) {
        http_response_code(400);
        $response = ['status' => 'error', 'message' => 'Email and password are required', 'data' => []];
        echo json_encode($response);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            $response = ['status' => 'error', 'message' => 'Email already exists', 'data' => []];
            echo json_encode($response);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO users (email, password, phone_number, address, role, full_name, gender, profile_image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$email, $password, $phone_number, $address, $role, $full_name, $gender, $profile_image, $is_active]);
        $response = ['status' => 'success', 'message' => 'User added', 'data' => ['user_id' => $conn->lastInsertId()]];
        echo json_encode($response);
    } catch (PDOException $e) {
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Failed to add user: ' . $e->getMessage(), 'data' => []];
        echo json_encode($response);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $phone_number = $data['phone_number'] ?? null;
    $address = $data['address'] ?? null;
    $role = $data['role'] ?? 'user';
    $full_name = $data['full_name'] ?? null;
    $gender = $data['gender'] ?? null;
    $profile_image = $data['profile_image'] ?? null;
    $is_active = isset($data['is_active']) ? 1 : 0;

    if (empty($email) || $id <= 0) {
        http_response_code(400);
        $response = ['status' => 'error', 'message' => 'Invalid input', 'data' => []];
        echo json_encode($response);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            $response = ['status' => 'error', 'message' => 'Email already exists', 'data' => []];
            echo json_encode($response);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("UPDATE users SET email = ?, phone_number = ?, address = ?, role = ?, full_name = ?, gender = ?, profile_image = ?, is_active = ? WHERE user_id = ?");
        $stmt->execute([$email, $phone_number, $address, $role, $full_name, $gender, $profile_image, $is_active, $id]);
        $response = ['status' => 'success', 'message' => 'User updated', 'data' => []];
        echo json_encode($response);
    } catch (PDOException $e) {
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Failed to update user: ' . $e->getMessage(), 'data' => []];
        echo json_encode($response);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        $response = ['status' => 'error', 'message' => 'Invalid user ID', 'data' => []];
        echo json_encode($response);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$id]);
        $response = ['status' => 'success', 'message' => 'User deleted', 'data' => []];
        echo json_encode($response);
    } catch (PDOException $e) {
        http_response_code(500);
        $response = ['status' => 'error', 'message' => 'Failed to delete user: ' . $e->getMessage(), 'data' => []];
        echo json_encode($response);
    }
}

$conn = null;
?>