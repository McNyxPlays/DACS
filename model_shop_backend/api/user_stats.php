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

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Count followers
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM follows WHERE following_id = ?");
    $stmt->execute([$user_id]);
    $followers = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Count following
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM follows WHERE follower_id = ?");
    $stmt->execute([$user_id]);
    $following = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Count posts
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND is_approved = TRUE");
    $stmt->execute([$user_id]);
    $posts = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'followers' => $followers,
        'following' => $following,
        'posts' => $posts
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error fetching stats: ' . $e->getMessage()]);
}
?>