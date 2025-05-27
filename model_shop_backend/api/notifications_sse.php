<?php
require_once '../config/database.php';
require_once '../config/functions.php';

// Set headers for Server-Sent Events (SSE)
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

$conn = db_connect();
if (!$conn) {
    echo "event: error\ndata: Database connection failed\n\n";
    flush();
    exit;
}

// Validate notifications table
try {
    $tableCheck = $conn->query("SHOW TABLES LIKE 'notifications'");
    if ($tableCheck->rowCount() === 0) {
        echo "event: error\ndata: Table 'notifications' does not exist\n\n";
        flush();
        exit;
    }
} catch (Exception $e) {
    echo "event: error\ndata: Server error: " . $e->getMessage() . "\n\n";
    flush();
    exit;
}

session_start();
if (!isset($_SESSION['user_id'])) {
    echo "event: error\ndata: Unauthorized\n\n";
    flush();
    exit;
}

$user_id = $_SESSION['user_id'];
session_write_close(); // Close session to prevent locking

if (!is_numeric($user_id) || $user_id <= 0) {
    echo "event: error\ndata: Invalid user_id\n\n";
    flush();
    exit;
}

$cache_file = sys_get_temp_dir() . "/notification_count_{$user_id}.txt";
$cache_duration = 30;

try {
    $last_count = -1;
    while (true) {
        // Check connection status
        if (connection_aborted()) {
            $conn = null;
            exit;
        }

        $unread_count = null;
        if (file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_duration) {
            $unread_count = (int) file_get_contents($cache_file);
        }

        if ($unread_count === null) {
            $stmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
            if (!$stmt->execute([$user_id])) {
                echo "event: error\ndata: Failed to fetch notification count\n\n";
                flush();
                break;
            }
            $unread_count = $stmt->fetchColumn();
            file_put_contents($cache_file, $unread_count, LOCK_EX);
        }

        if ($last_count !== $unread_count) {
            echo "event: notification_count\ndata: " . min($unread_count, 99) . "\n\n";
            ob_flush();
            flush();
            $last_count = $unread_count;
        }

        sleep($last_count === $unread_count ? 10 : 5);
    }
} catch (Exception $e) {
    echo "event: error\ndata: Server error: " . $e->getMessage() . "\n\n";
    ob_flush();
    flush();
}

$conn = null;
?>