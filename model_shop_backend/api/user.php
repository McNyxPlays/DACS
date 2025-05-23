<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

// Use db_connect() to ensure consistency with notifications.php
$conn = db_connect();
if ($conn === null) {
    http_response_code(500);
    $errorMsg = 'Database connection failed';
    log_error($errorMsg);
    echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    log_error("GET request to user.php, Session: " . json_encode($_SESSION) . " at " . date('Y-m-d H:i:s'));
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        $errorMsg = 'Unauthorized: Please log in';
        log_error($errorMsg);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $conn->prepare("SELECT user_id, email, full_name, phone_number, gender, address, profile_image, role FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $user['phone_number'] = $user['phone_number'] ?? "";
            $user['address'] = $user['address'] ?? "";
            $user['gender'] = $user['gender'] ?? "";
            $user['profile_image'] = $user['profile_image'] ?? "";
            http_response_code(200);
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        $errorMsg = 'Error fetching user: ' . $e->getMessage();
        log_error($errorMsg);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        $conn = null;
        exit;
    }

    session_unset();
    session_destroy();
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Logout successful']);
    $conn = null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = $_POST; // For text fields
    $full_name = sanitize_input($data['full_name'] ?? '');
    $email = sanitize_input($data['email'] ?? '');
    $phone_number = sanitize_input($data['phone_number'] ?? null);
    $gender = sanitize_input($data['gender'] ?? null);
    $address = sanitize_input($data['address'] ?? null);
    $current_password = $data['current_password'] ?? '';
    $new_password = $data['new_password'] ?? '';
    $profile_image = $_FILES['profile_image'] ?? null;

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Valid email is required']);
        $conn = null;
        exit;
    }

    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $stmt->execute([$email, $user_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
        $conn = null;
        exit;
    }

    try {
        $profile_image_path = null;
        if ($profile_image && $profile_image['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../uploads/profiles/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            $file_name = uniqid() . '_' . basename($profile_image['name']);
            $target_file = $upload_dir . $file_name;
            if (move_uploaded_file($profile_image['tmp_name'], $target_file)) {
                $profile_image_path = 'uploads/profiles/' . $file_name;
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to upload image']);
                $conn = null;
                exit;
            }
        }

        $password_sql = '';
        $password_params = [];
        if ($current_password && $new_password) {
            $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!password_verify($current_password, $user['password'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect']);
                $conn = null;
                exit;
            }
            $password_sql = ', password = ?';
            $password_params = [password_hash($new_password, PASSWORD_DEFAULT)];
        }

        $sql = "UPDATE users SET full_name = ?, email = ?, phone_number = ?, gender = ?, address = ?, profile_image = ? $password_sql WHERE user_id = ?";
        $params = array_merge([$full_name, $email, $phone_number, $gender, $address, $profile_image_path ?? null], $password_params, [$user_id]);
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        $stmt = $conn->prepare("SELECT user_id, email, full_name, phone_number, gender, address, profile_image, role FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $updated_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($updated_user) {
            $updated_user['phone_number'] = $updated_user['phone_number'] ?? "";
            $updated_user['address'] = $updated_user['address'] ?? "";
            $updated_user['gender'] = $updated_user['gender'] ?? "";
            $updated_user['profile_image'] = $updated_user['profile_image'] ?? "";
            http_response_code(200);
            echo json_encode(['status' => 'success', 'user' => $updated_user]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found or no changes made']);
        }
    } catch (PDOException $e) {
        http_response_code(400);
        if ($e->getCode() == '23000') {
            echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Update failed: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $conn->prepare("UPDATE users SET is_active = FALSE WHERE user_id = ?");
        $stmt->execute([$user_id]);

        if ($stmt->rowCount() > 0) {
            session_unset();
            session_destroy();
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'User account deactivated']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Deletion failed: ' . $e->getMessage()]);
    }
}

$conn = null;
?>