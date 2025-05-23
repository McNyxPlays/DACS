<?php
require_once '../config/database.php';
require_once '../config/functions.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

$conn = db_connect();
if (!$conn) {
    echo "event: error\ndata: Database connection failed\n\n";
    exit;
}

session_start();
if (!isset($_SESSION['user_id'])) {
    echo "event: error\ndata: Unauthorized\n\n";
    exit;
}

$user_id = $_SESSION['user_id'];
if (!is_numeric($user_id) || $user_id <= 0) {
    echo "event: error\ndata: Invalid user_id\n\n";
    exit;
}

try {
    // Keep the connection alive
    while (true) {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$user_id]);
        $unread_count = $stmt->fetchColumn();

        echo "event: notification_count\ndata: " . min($unread_count, 99) . "\n\n";
        ob_flush();
        flush();

        // Check every 5 seconds
        sleep(5);
    }
} catch (Exception $e) {
    echo "event: error\ndata: Server error: " . $e->getMessage() . "\n\n";
    ob_flush();
    flush();
}

$conn = null;
?>