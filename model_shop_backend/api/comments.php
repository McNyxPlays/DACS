<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

$conn = db_connect();
if ($conn === null) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $post_id = filter_var($_GET['post_id'] ?? 0, FILTER_VALIDATE_INT);
    if (!$post_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid post ID']);
        $conn = null;
        exit;
    }

    try {
        $stmt = $conn->prepare(
            "SELECT c.comment_id, c.content, c.created_at, u.full_name
             FROM comments c 
             JOIN users u ON c.user_id = u.user_id 
             WHERE c.post_id = ? 
             ORDER BY c.created_at ASC"
        );
        $stmt->execute([$post_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(['status' => 'success', 'comments' => $comments]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error fetching comments: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}

$conn = null;
?>