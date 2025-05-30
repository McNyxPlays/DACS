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

// Function to handle file upload
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
    $is_active = isset($_POST['is_active']) ? (($_POST['is_active'] === '1' || $_POST['is_active'] === 'true') ? 1 : 0) : 1; // Default to 1 if not provided

    error_log("POST request - is_active received: " . $_POST['is_active'] . ", processed as: " . $is_active);

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

        error_log("POST request - User added with user_id: $user_id, is_active: $is_active");

        echo json_encode(['success' => true, 'message' => 'User added', 'data' => ['user_id' => $user_id]]);
    } catch (PDOException $e) {
        error_log("POST request - Failed to add user: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add user: ' . $e->getMessage(), 'data' => []]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $email = $_POST['email'] ?? '';
    $phone_number = $_POST['phone_number'] ?? null;
    $address = $_POST['address'] ?? null;
    $role = $_POST['role'] ?? 'user';
    $full_name = $_POST['full_name'] ?? null;
    $gender = $_POST['gender'] ?? null;
    $is_active = isset($_POST['is_active']) ? (($_POST['is_active'] === '1' || $_POST['is_active'] === 'true') ? 1 : 0) : 1;

    // Fallback to parse raw input if $_POST is empty (for multipart/form-data)
    if (empty($_POST) && !empty(file_get_contents('php://input'))) {
        $rawData = [];
        parse_str(file_get_contents('php://input'), $rawData);
        $email = $rawData['email'] ?? $email;
        $phone_number = $rawData['phone_number'] ?? $phone_number;
        $address = $rawData['address'] ?? $address;
        $role = $rawData['role'] ?? $role;
        $full_name = $rawData['full_name'] ?? $full_name;
        $gender = $rawData['gender'] ?? $gender;
        $is_active = isset($rawData['is_active']) ? (($rawData['is_active'] === '1' || $rawData['is_active'] === 'true') ? 1 : 0) : $is_active;
    }

    error_log("PUT request - Received data: " . json_encode($_POST) . ", Raw data: " . json_encode($rawData ?? []) . ", is_active: $is_active");

    if (empty($email) || $id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email and valid user ID are required', 'data' => []]);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already exists', 'data' => []]);
            $conn = null;
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE users
            SET email = ?, phone_number = ?, address = ?, role = ?, full_name = ?, gender = ?, is_active = ?
            WHERE user_id = ?
        ");
        $stmt->execute([$email, $phone_number, $address, $role, $full_name, $gender, $is_active, $id]);

        error_log("PUT request - Updated user_id: $id, is_active set to: $is_active");

        // Handle profile image update if provided
        if (isset($_FILES['image'])) {
            $image_url = handleFileUpload($_FILES['image'], $id);
            if ($image_url) {
                $stmt = $conn->prepare("
                    INSERT INTO user_images (user_id, image_url, image_type, is_active)
                    VALUES (?, ?, 'profile', TRUE)
                    ON DUPLICATE KEY UPDATE image_url = ?, is_active = TRUE
                ");
                $stmt->execute([$id, $image_url, $image_url]);
                error_log("PUT request - Updated profile image for user_id: $id, image_url: $image_url");
            }
        }

        echo json_encode(['success' => true, 'message' => 'User updated', 'data' => []]);
    } catch (Exception $e) {
        error_log("PUT request - Failed to update user: " . $e->getMessage());
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
        error_log("DELETE request - Failed to delete user: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $e->getMessage(), 'data' => []]);
    }
}

$conn = null;
?>