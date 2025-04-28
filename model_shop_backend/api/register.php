<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = sanitize_input($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $full_name = sanitize_input($data['full_name'] ?? '');

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['message' => 'Email and password are required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid email format']);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['message' => 'Password must be at least 8 characters']);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    try {
        $database = new Database();
        $pdo = $database->getConnection();
        $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, is_active) VALUES (?, ?, ?, ?)");
        $stmt->execute([$email, $hashed_password, $full_name, TRUE]);
        http_response_code(201);
        echo json_encode(['message' => 'User registered successfully']);
    } catch (PDOException $e) {
        http_response_code(400);
        if ($e->getCode() == '23000') {
            echo json_encode(['message' => 'Email already exists']);
        } else {
            echo json_encode(['message' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
}
?>