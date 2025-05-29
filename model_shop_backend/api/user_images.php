<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    log_error("GET request to user_images.php, Session: " . json_encode($_SESSION) . " at " . date('Y-m-d H:i:s'));
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
        $stmt = $conn->prepare("SELECT image_id, image_url, image_type FROM user_images WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $user_images = [
            'profile' => null,
            'banner' => null
        ];
        foreach ($images as $image) {
            if ($image['image_type'] === 'profile') {
                $user_images['profile'] = $image['image_url'];
            } elseif ($image['image_type'] === 'banner') {
                $user_images['banner'] = $image['image_url'];
            }
        }

        http_response_code(200);
        echo json_encode(['status' => 'success', 'images' => $user_images]);
    } catch (Exception $e) {
        http_response_code(500);
        $errorMsg = 'Error fetching user images: ' . $e->getMessage();
        log_error($errorMsg);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight requests
    http_response_code(204);
    exit;
}

$conn = null;
?>