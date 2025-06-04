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
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - No session']);
    exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Not an admin']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $stmt = $conn->prepare("SELECT u.user_id, u.email, u.phone_number, u.address, u.role, u.full_name, u.gender, u.is_active, u.created_at FROM users u WHERE u.user_id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            echo json_encode(['success' => true, 'message' => 'User fetched', 'data' => [$user]]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } else {
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        $is_active = isset($_GET['is_active']) ? intval($_GET['is_active']) : -1;
        $query = "SELECT u.user_id, u.email, u.phone_number, u.address, u.role, u.full_name, u.gender, u.is_active, u.created_at FROM users u WHERE u.email LIKE ? OR u.phone_number LIKE ?";
        $params = [$search, $search];
        if ($is_active >= 0) {
            $query .= " AND u.is_active = ?";
            $params[] = $is_active;
        }
        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'message' => 'Users fetched', 'data' => $users]);
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
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit;
    }

    if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }

    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO users (email, password, phone_number, address, role, full_name, gender, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$email, $password, $phone_number, $address, $role, $full_name, $gender, $is_active]);
        $new_user_id = $conn->lastInsertId();

        echo json_encode(['success' => true, 'message' => 'User added', 'data' => ['user_id' => $new_user_id]]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add user: ' . $e->getMessage()]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }

    // Read raw input and parse it for FormData
    $input = file_get_contents('php://input');
    $formData = [];
    parse_str($input, $formData);

    $email = $formData['email'] ?? null;
    $phone_number = $formData['phone_number'] ?? null;
    $address = $formData['address'] ?? null;
    $role = $formData['role'] ?? 'user';
    $full_name = $formData['full_name'] ?? null;
    $gender = $formData['gender'] ?? null;
    $is_active = isset($formData['is_active']) ? ($formData['is_active'] == '1' || $formData['is_active'] == 'true' ? 1 : 0) : 1;

    $conn->beginTransaction();
    try {
        // Fetch the original user data
        $stmt = $conn->prepare("SELECT email FROM users WHERE user_id = ?");
        $stmt->execute([$id]);
        $originalUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$originalUser) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            $conn->rollBack();
            exit;
        }

        // Use original email if not provided
        $email = $email !== null && $email !== '' ? $email : $originalUser['email'];

        // Validate email if it has changed
        if ($email !== $originalUser['email']) {
            if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid email format']);
                $conn->rollBack();
                exit;
            }

            $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
            $stmt->execute([$email, $id]);
            if ($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                $conn->rollBack();
                exit;
            }
        }

        // Update the user in the database
        $stmt = $conn->prepare("UPDATE users SET email = ?, phone_number = ?, address = ?, role = ?, full_name = ?, gender = ?, is_active = ? WHERE user_id = ?");
        $stmt->execute([$email, $phone_number, $address, $role, $full_name, $gender, $is_active, $id]);

        // Check if any rows were actually updated
        if ($stmt->rowCount() > 0) {
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'User updated']);
        } else {
            $conn->rollBack();
            echo json_encode(['success' => false, 'message' => 'No changes made to user']);
        }
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'User deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

$conn = null;
?>