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
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'data' => []]);
    exit;
}

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - No session', 'data' => []]);
    exit;
}

$user_id = $_SESSION['user_id'];
try {
    $stmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to check user role: ' . $e->getMessage(), 'data' => []]);
    $conn = null;
    exit;
}

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Not an admin', 'data' => []]);
    $conn = null;
    exit;
}

function handleFileUpload($file, $user_id) {
    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowed_types)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        throw new Exception('File size exceeds 5MB limit.');
    }

    $upload_dir = '../Uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $user_id . '_' . time() . '.' . $extension;
    $destination = $upload_dir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception('Failed to upload file.');
    }

    return 'Uploads/' . $filename;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        try {
            $stmt = $conn->prepare("
                SELECT u.user_id, u.email, u.phone_number, u.address, u.role, u.full_name, u.gender, u.is_active, u.created_at,
                       (SELECT image_url FROM user_images WHERE user_id = u.user_id AND image_type = 'profile' AND is_active = TRUE LIMIT 1) as profile_image
                FROM users u
                WHERE u.user_id = ?
            ");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                echo json_encode(['success' => true, 'message' => 'User fetched successfully', 'data' => [$user]]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'User not found', 'data' => []]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch user: ' . $e->getMessage(), 'data' => []]);
        }
    } else {
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        $is_active = isset($_GET['is_active']) ? intval($_GET['is_active']) : -1;

        $query = "
            SELECT u.user_id, u.email, u.phone_number, u.address, u.role, u.full_name, u.gender, u.is_active, u.created_at,
                   (SELECT image_url FROM user_images WHERE user_id = u.user_id AND image_type = 'profile' AND is_active = TRUE LIMIT 1) as profile_image
            FROM users u
            WHERE u.email LIKE ? OR u.phone_number LIKE ?
        ";
        $params = [$search, $search];

        if ($is_active >= 0) {
            $query .= " AND u.is_active = ?";
            $params[] = $is_active;
        }

        try {
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'message' => 'Users fetched successfully', 'data' => $users]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database query failed: ' . $e->getMessage(), 'data' => []]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT);
    $phone_number = $_POST['phone_number'] ?? null;
    $address = $_POST['address'] ?? null;
    $role = $_POST['role'] ?? 'user';
    $full_name = $_POST['full_name'] ?? null;
    $gender = $_POST['gender'] ?? null;
    $is_active = isset($_POST['is_active']) ? (($_POST['is_active'] === '1' || $_POST['is_active'] === 'true') ? 1 : 0) : 1;

    if (empty($email) || empty($_POST['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and password are required', 'data' => []]);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already exists', 'data' => []]);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("
            INSERT INTO users (email, password, phone_number, address, role, full_name, gender, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$email, $password, $phone_number, $address, $role, $full_name, $gender, $is_active]);
        $user_id = $conn->lastInsertId();

        echo json_encode(['success' => true, 'message' => 'User added', 'data' => ['user_id' => $user_id]]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add user: ' . $e->getMessage(), 'data' => []]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    $rawData = [];
    if (!empty(file_get_contents('php://input'))) {
        parse_str(file_get_contents('php://input'), $rawData);
    }
    $formData = array_merge($_POST, $rawData);

    $email = $formData['email'] ?? '';
    $phone_number = $formData['phone_number'] ?? null;
    $address = $formData['address'] ?? null;
    $role = $formData['role'] ?? 'user';
    $full_name = $formData['full_name'] ?? null;
    $gender = $formData['gender'] ?? null;
    $is_active = isset($formData['is_active']) ? (($formData['is_active'] === '1' || $formData['is_active'] === 'true') ? 1 : 0) : 1;
    $remove_image = isset($formData['remove_image']) && $formData['remove_image'] === 'true';

    if (empty($email) || $id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and valid user ID are required', 'data' => []]);
        $conn = null;
        exit;
    }

    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already exists', 'data' => []]);
            $conn->rollBack();
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE users
            SET email = ?, phone_number = ?, address = ?, role = ?, full_name = ?, gender = ?, is_active = ?
            WHERE user_id = ?
        ");
        $stmt->execute([$email, $phone_number, $address, $role, $full_name, $gender, $is_active, $id]);

        if ($remove_image) {
            $stmt = $conn->prepare("SELECT image_url FROM user_images WHERE user_id = ? AND image_type = 'profile' AND is_active = TRUE");
            $stmt->execute([$id]);
            $existing_image = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($existing_image) {
                $file_path = realpath(__DIR__ . '/../' . $existing_image['image_url']);
                if (file_exists($file_path)) {
                    unlink($file_path);
                }
                $stmt = $conn->prepare("UPDATE user_images SET is_active = FALSE WHERE user_id = ? AND image_type = 'profile'");
                $stmt->execute([$id]);
            }
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'User updated', 'data' => []]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . $e->getMessage(), 'data' => []]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user ID', 'data' => []]);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'User deleted', 'data' => []]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found', 'data' => []]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $e->getMessage(), 'data' => []]);
    }
}

$conn = null;
?>