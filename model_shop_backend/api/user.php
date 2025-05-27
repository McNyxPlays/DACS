<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

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
        $stmt = $conn->prepare("SELECT user_id, email, full_name, phone_number, gender, address, profile_image, role, is_active, created_at FROM users WHERE user_id = ? AND is_active = TRUE");
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

    $conn->beginTransaction();

    try {
        $stmt = $conn->prepare("SELECT email, password, profile_image, role, is_active FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $current_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$current_user) {
            throw new Exception('User not found');
        }

        // Handle form data from multipart/form-data
        $full_name = sanitize_input($_POST['full_name'] ?? '');
        $email = sanitize_input($_POST['email'] ?? $current_user['email']);
        $phone_number = sanitize_input($_POST['phone_number'] ?? null);
        $gender = sanitize_input($_POST['gender'] ?? null);
        $address = sanitize_input($_POST['address'] ?? null);
        $role = $current_user['role'];
        $is_active = $current_user['is_active'];
        $current_password = $_POST['current_password'] ?? '';
        $new_password = $_POST['new_password'] ?? '';
        $profile_image = $_FILES['profile_image'] ?? null;

        log_error("Received data in PUT request: full_name=$full_name, email=$email, phone_number=$phone_number, gender=$gender, address=$address, role=$role, is_active=$is_active, profile_image=" . ($profile_image ? json_encode($profile_image) : 'null'));

        if (empty($full_name)) {
            throw new Exception('Display name is required');
        }

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Valid email is required');
        }

        if ($email !== $current_user['email']) {
            $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
            $stmt->execute([$email, $user_id]);
            if ($stmt->fetch()) {
                throw new Exception('Email already exists');
            }
        }

        if ($phone_number && !preg_match('/^\+?\d{10,15}$/', $phone_number)) {
            throw new Exception('Invalid phone number format (must be 10-15 digits, optionally starting with +)');
        }

        $profile_image_path = $current_user['profile_image'];
        if ($profile_image && $profile_image['error'] === UPLOAD_ERR_OK) {
            $maxFileSize = 5 * 1024 * 1024;
            if ($profile_image['size'] > $maxFileSize) {
                throw new Exception('Profile image size exceeds 5MB limit');
            }
            $upload_dir = '../public/uploads/avatars/';
            if (!file_exists($upload_dir)) {
                if (!mkdir($upload_dir, 0777, true)) {
                    throw new Exception('Failed to create upload directory');
                }
            }
            if (!is_writable($upload_dir)) {
                throw new Exception('Upload directory is not writable');
            }
            $file_name = uniqid() . '_' . basename($profile_image['name']);
            $target_file = $upload_dir . $file_name;
            if (move_uploaded_file($profile_image['tmp_name'], $target_file)) {
                $profile_image_path = 'uploads/avatars/' . $file_name;
            } else {
                throw new Exception('Failed to upload image');
            }
        } elseif (isset($_POST['remove_profile_image']) && $_POST['remove_profile_image'] === 'true') {
            $profile_image_path = null;
            if ($current_user['profile_image'] && file_exists('../public/' . $current_user['profile_image'])) {
                unlink('../public/' . $current_user['profile_image']);
            }
        }

        $password_sql = '';
        $password_params = [];
        if ($current_password && $new_password) {
            if (!password_verify($current_password, $current_user['password'])) {
                throw new Exception('Current password is incorrect');
            }
            $password_sql = ', password = ?';
            $password_params = [password_hash($new_password, PASSWORD_DEFAULT)];
        }

        $sql = "UPDATE users SET full_name = ?, email = ?, phone_number = ?, gender = ?, address = ?, profile_image = ?, role = ?, is_active = ? $password_sql WHERE user_id = ?";
        $params = array_merge([$full_name, $email, $phone_number, $gender, $address, $profile_image_path, $role, $is_active], $password_params, [$user_id]);
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        $stmt = $conn->prepare("SELECT user_id, email, full_name, phone_number, gender, address, profile_image, role, is_active, created_at FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $updated_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($updated_user) {
            $updated_user['phone_number'] = $updated_user['phone_number'] ?? "";
            $updated_user['address'] = $updated_user['address'] ?? "";
            $updated_user['gender'] = $updated_user['gender'] ?? "";
            $updated_user['profile_image'] = $updated_user['profile_image'] ?? "";
            $conn->commit();
            http_response_code(200);
            echo json_encode(['status' => 'success', 'user' => $updated_user]);
        } else {
            throw new Exception('User not found or no changes made');
        }
    } catch (Exception $e) {
        $conn->rollBack();
        $errorMsg = $e->getMessage();
        log_error("PUT request error: $errorMsg, Stack trace: " . $e->getTraceAsString());
        http_response_code($errorMsg === 'Failed to upload image' ? 500 : 400);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
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