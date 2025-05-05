<?php
session_start([
    'cookie_samesite' => 'None',
    'cookie_secure' => false,
]);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

error_log("Login request started: " . date('Y-m-d H:i:s'));

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = sanitize_input($data['email'] ?? '');
    $password = $data['password'] ?? '';

    error_log("Received: email=$email, password=[hidden]");

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['message' => 'Email and password are required']);
        error_log("Error: Email or password missing");
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid email format']);
        error_log("Error: Invalid email format");
        exit;
    }

    if (isset($_SESSION['login_attempts']) && $_SESSION['login_attempts'] >= 5) {
        http_response_code(429);
        echo json_encode(['message' => 'Too many login attempts. Try again later.']);
        error_log("Error: Too many login attempts");
        exit;
    }

    try {
        $database = new Database();
        $pdo = $database->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        error_log("Query result: " . print_r($user, true));

        if (!$user) {
            $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
            http_response_code(401);
            echo json_encode(['message' => 'User not found']);
            error_log("Error: User not found for email=$email");
            exit;
        }

        if (!$user['is_active']) {
            http_response_code(403);
            echo json_encode(['message' => 'Account not activated. Please check your email.']);
            error_log("Error: Account not activated for email=$email");
            exit;
        }

        error_log("Stored hash: " . $user['password']);
        error_log("Password verify result: " . password_verify($password, $user['password']));
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['login_attempts'] = 0;
            error_log("Success: Session user_id set to " . $user['user_id']);
            error_log("Session ID: " . session_id());
            http_response_code(200);
            echo json_encode([
                'message' => 'Login successful',
                'user' => [
                    'user_id' => $user['user_id'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role'],
                    'profile_image' => $user['profile_image'] ?? null
                ]
            ]);
        } else {
            $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
            http_response_code(401);
            echo json_encode(['message' => 'Invalid password']);
            error_log("Error: Invalid password for email=$email");
            exit;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Login failed: ' . $e->getMessage()]);
        error_log("Error: Login failed - " . $e->getMessage());
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    error_log("Error: Method not allowed");
}
?>