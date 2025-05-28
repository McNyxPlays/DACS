<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

$database = new Database();
$pdo = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $post_id = filter_var($_GET['post_id'] ?? 0, FILTER_VALIDATE_INT);

    if (!$post_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid post ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT image_url FROM post_images WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'images' => $images
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error fetching images: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>