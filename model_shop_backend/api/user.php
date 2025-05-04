<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

$database = new Database();
$pdo = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $pdo->prepare("SELECT user_id, email, full_name, phone_number, gender, address, profile_image, role FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Chuyển null thành chuỗi rỗng cho các trường
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
        echo json_encode(['status' => 'error', 'message' => 'Error fetching user: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    session_unset();
    session_destroy();
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Logout successful']);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $full_name = sanitize_input($data['full_name'] ?? '');
    $email = sanitize_input($data['email'] ?? '');
    $phone_number = sanitize_input($data['phone_number'] ?? null);
    $gender = sanitize_input($data['gender'] ?? null);
    $address = sanitize_input($data['address'] ?? null);
    $profile_image = $data['profile_image'] ?? null;
    $current_password = $data['current_password'] ?? '';
    $new_password = $data['new_password'] ?? '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Valid email is required']);
        exit;
    }

    // Kiểm tra email trùng lặp
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $stmt->execute([$email, $user_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
        exit;
    }

    try {
        // Kiểm tra mật khẩu hiện tại nếu thay đổi mật khẩu
        $password_sql = '';
        $password_params = [];
        if ($current_password && $new_password) {
            $stmt = $pdo->prepare("SELECT password FROM users WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!password_verify($current_password, $user['password'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect']);
                exit;
            }
            $password_sql = ', password = ?';
            $password_params = [password_hash($new_password, PASSWORD_DEFAULT)];
        }

        // Cập nhật thông tin người dùng
        $sql = "UPDATE users SET full_name = ?, email = ?, phone_number = ?, gender = ?, address = ?, profile_image = ? $password_sql WHERE user_id = ?";
        $params = array_merge([$full_name, $email, $phone_number, $gender, $address, $profile_image], $password_params, [$user_id]);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Lấy thông tin người dùng sau khi cập nhật
        $stmt = $pdo->prepare("SELECT user_id, email, full_name, phone_number, gender, address, profile_image, role FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $updated_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($updated_user) {
            // Chuyển null thành chuỗi rỗng cho các trường
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
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $pdo->prepare("UPDATE users SET is_active = FALSE WHERE user_id = ?");
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
?>