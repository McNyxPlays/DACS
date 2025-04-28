<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Cập nhật port nếu cần
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
        echo json_encode(['message' => 'Unauthorized: Please log in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $pdo->prepare("SELECT user_id, email, full_name, role, profile_image FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            http_response_code(200);
            echo json_encode(['user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'User not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Error fetching user: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Not logged in']);
        exit;
    }

    session_unset();
    session_destroy();
    http_response_code(200);
    echo json_encode(['message' => 'Logout successful']);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Unauthorized: Please log in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $full_name = sanitize_input($data['full_name'] ?? '');
    $email = sanitize_input($data['email'] ?? '');
    $profile_image = $data['profile_image'] ?? null;

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Valid email is required']);
        exit;
    }

    // Kiểm tra email trùng lặp
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $stmt->execute([$email, $user_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['message' => 'Email already exists']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, profile_image = ? WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$full_name, $email, $profile_image, $user_id]);

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'User updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'User not found or no changes made']);
        }
    } catch (PDOException $e) {
        http_response_code(400);
        if ($e->getCode() == '23000') {
            echo json_encode(['message' => 'Email already exists']);
        } else {
            echo json_encode(['message' => 'Update failed: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Unauthorized: Please log in']);
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
            echo json_encode(['message' => 'User account deactivated']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'User not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Deletion failed: ' . $e->getMessage()]);
    }
}
?>