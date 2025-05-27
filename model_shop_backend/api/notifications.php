<?php
require_once '../config/database.php';
require_once '../config/functions.php';

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    $errorMsg = 'Database connection failed';
    log_error($errorMsg);
    echo json_encode(['success' => false, 'error' => $errorMsg]);
    exit;
}

try {
    // Start session and validate user
    session_start();
    if (!isset($_SESSION['user_id'])) {
        http_response_code(403);
        $errorMsg = 'Unauthorized: No active session';
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];
    if (!is_numeric($user_id) || $user_id <= 0) {
        http_response_code(400);
        $errorMsg = "Invalid user_id: $user_id";
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

    // Validate user exists and is active
    $stmt = $conn->prepare("SELECT user_id, is_active FROM users WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || !$user['is_active']) {
        http_response_code(403);
        $errorMsg = "User not found or inactive";
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

    // Validate notifications table
    $tableCheck = $conn->query("SHOW TABLES LIKE 'notifications'");
    if ($tableCheck->rowCount() === 0) {
        throw new Exception("Table 'notifications' does not exist");
    }

    $columnsCheck = $conn->query("SHOW COLUMNS FROM notifications");
    $columns = $columnsCheck->fetchAll(PDO::FETCH_COLUMN);
    $expectedColumns = ['notification_id', 'user_id', 'message', 'type', 'is_read', 'created_at'];
    $missingColumns = array_diff($expectedColumns, $columns);
    if (!empty($missingColumns)) {
        throw new Exception("Missing columns in notifications table: " . implode(', ', $missingColumns));
    }

    // Clear SSE cache when notifications are updated
    $cache_file = sys_get_temp_dir() . "/notification_count_{$user_id}.txt";
    $clearCache = function () use ($cache_file) {
        if (file_exists($cache_file)) {
            unlink($cache_file);
        }
    };

    // Handle POST requests
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $postData = json_decode(file_get_contents('php://input'), true);
        if (!isset($postData['action'])) {
            http_response_code(400);
            $errorMsg = 'Invalid action';
            log_error($errorMsg);
            echo json_encode(['success' => false, 'error' => $errorMsg]);
            $conn = null;
            exit;
        }

        if ($postData['action'] === 'markAsRead') {
            $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :user_id AND is_read = 0");
            if (!$stmt->execute(['user_id' => $user_id])) {
                $errorMsg = "Failed to mark notifications as read: " . json_encode($stmt->errorInfo());
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
            } else {
                $rowsAffected = $stmt->rowCount();
                $clearCache();
                log_error("Marked $rowsAffected notifications as read for user_id: $user_id");
                echo json_encode(['success' => true, 'rows_affected' => $rowsAffected]);
            }
            $conn = null;
            exit;
        } elseif ($postData['action'] === 'markSingleAsRead' && isset($postData['notification_id'])) {
            $notification_id = (int)$postData['notification_id'];
            if ($notification_id <= 0) {
                http_response_code(400);
                $errorMsg = "Invalid notification_id: $notification_id";
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
                $conn = null;
                exit;
            }
            $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE notification_id = :notification_id AND user_id = :user_id AND is_read = 0");
            if (!$stmt->execute(['notification_id' => $notification_id, 'user_id' => $user_id])) {
                $errorMsg = "Failed to mark notification as read: " . json_encode($stmt->errorInfo());
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
            } else {
                $rowsAffected = $stmt->rowCount();
                $clearCache();
                log_error("Marked notification $notification_id as read for user_id: $user_id");
                echo json_encode(['success' => true, 'rows_affected' => $rowsAffected]);
            }
            $conn = null;
            exit;
        } elseif ($postData['action'] === 'delete') {
            $stmt = $conn->prepare("DELETE FROM notifications WHERE user_id = :user_id");
            if (!$stmt->execute(['user_id' => $user_id])) {
                $errorMsg = "Failed to delete notifications: " . json_encode($stmt->errorInfo());
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
            } else {
                $rowsAffected = $stmt->rowCount();
                $clearCache();
                log_error("Deleted $rowsAffected notifications for user_id: $user_id");
                echo json_encode(['success' => true, 'rows_affected' => $rowsAffected]);
            }
            $conn = null;
            exit;
        }
        http_response_code(400);
        $errorMsg = 'Invalid action';
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

    // Handle GET requests
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'count') {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = 0");
        if (!$stmt->execute(['user_id' => $user_id])) {
            $errorMsg = "Failed to count notifications: " . json_encode($stmt->errorInfo());
            log_error($errorMsg);
            echo json_encode(['success' => false, 'error' => $errorMsg]);
            $conn = null;
            exit;
        }
        $count = $stmt->fetchColumn();
        echo json_encode(['success' => true, 'unread_count' => min($count, 99)]);
        $conn = null;
        exit;
    }

    // Fetch notifications with filters
    $validFilters = ['All', 'Unread', 'Read'];
    $validCategories = ['All Categories', 'order', 'system', 'custom', 'message', 'social', 'shopping', 'events', 'account'];
    $validSorts = ['Newest First', 'Oldest First'];

    $filter = isset($_GET['filter']) && in_array($_GET['filter'], $validFilters) ? $_GET['filter'] : 'All';
    $category = isset($_GET['category']) && in_array($_GET['category'], $validCategories) ? $_GET['category'] : 'All Categories';
    $sort = isset($_GET['sort']) && in_array($_GET['sort'], $validSorts) ? $_GET['sort'] : 'Newest First';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 10;

    $offset = ($page - 1) * $perPage;

    $query = "SELECT notification_id, user_id, message, type, is_read, created_at FROM notifications WHERE user_id = :user_id";
    $params = ['user_id' => $user_id];
    if ($filter === 'Unread') {
        $query .= " AND is_read = :is_read";
        $params['is_read'] = 0;
    } elseif ($filter === 'Read') {
        $query .= " AND is_read = :is_read";
        $params['is_read'] = 1;
    }
    if ($category !== 'All Categories') {
        $query .= " AND type = :category";
        $params['category'] = strtolower($category); // Ensure case consistency
    }
    $query .= $sort === 'Newest First' ? " ORDER BY created_at DESC" : " ORDER BY created_at ASC";
    // Append LIMIT clause directly with sanitized integers
    $query .= " LIMIT " . (int)$offset . ", " . (int)$perPage;

    $stmt = $conn->prepare($query);
    if (!$stmt->execute($params)) {
        $errorMsg = "Failed to fetch notifications: " . json_encode($stmt->errorInfo());
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $totalQuery = "SELECT COUNT(*) FROM notifications WHERE user_id = :user_id";
    $totalParams = ['user_id' => $user_id];
    if ($filter === 'Unread') {
        $totalQuery .= " AND is_read = :is_read";
        $totalParams['is_read'] = 0;
    } elseif ($filter === 'Read') {
        $totalQuery .= " AND is_read = :is_read";
        $totalParams['is_read'] = 1;
    }
    if ($category !== 'All Categories') {
        $totalQuery .= " AND type = :category";
        $totalParams['category'] = strtolower($category);
    }
    $totalStmt = $conn->prepare($totalQuery);
    if (!$totalStmt->execute($totalParams)) {
        $errorMsg = "Failed to count total notifications: " . json_encode($totalStmt->errorInfo());
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }
    $total = $totalStmt->fetchColumn();
    $totalPages = ceil($total / $perPage);

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'totalPages' => $totalPages
    ]);
} catch (Exception $e) {
    http_response_code(500);
    $errorMsg = "Server error: " . $e->getMessage();
    log_error($errorMsg);
    echo json_encode(['success' => false, 'error' => $errorMsg]);
}

$conn = null;
?>