<?php
require_once '../config/database.php';
require_once '../config/functions.php';

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
    session_start();
    log_error("Session data: " . json_encode($_SESSION) . " at " . date('Y-m-d H:i:s'));
    if (!isset($_SESSION['user_id'])) {
        http_response_code(403);
        $errorMsg = 'Unauthorized';
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];
    log_error("User ID: $user_id at " . date('Y-m-d H:i:s'));

    if (!is_numeric($user_id) || $user_id <= 0) {
        http_response_code(400);
        $errorMsg = "Invalid user_id format: $user_id";
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

    $stmt = $conn->prepare("SELECT user_id FROM users WHERE user_id = ? AND is_active = TRUE");
    $stmt->execute([$user_id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        $errorMsg = "User not found or inactive";
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }

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
    log_error("Columns in notifications table: " . json_encode($columns) . " at " . date('Y-m-d H:i:s'));

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
        if ($_POST['action'] === 'markAsRead') {
            $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
            if (!$stmt->execute([$user_id])) {
                $errorInfo = $stmt->errorInfo();
                $errorMsg = "Failed to execute update: " . json_encode($errorInfo);
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
                $conn = null;
                exit;
            }
            $rowsAffected = $stmt->rowCount();
            if ($rowsAffected > 0) {
                echo json_encode(['success' => true, 'status' => 'success', 'rows_affected' => $rowsAffected]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No unread notifications found to mark as read']);
            }
            $conn = null;
            exit;
        } elseif ($_POST['action'] === 'markSingleAsRead' && isset($_POST['notification_id'])) {
            $notification_id = (int)$_POST['notification_id'];
            if ($notification_id <= 0) {
                $errorMsg = "Invalid notification_id";
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
                $conn = null;
                exit;
            }
            $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ? AND is_read = 0");
            if (!$stmt->execute([$notification_id, $user_id])) {
                $errorInfo = $stmt->errorInfo();
                $errorMsg = "Failed to execute update: " . json_encode($errorInfo);
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
                $conn = null;
                exit;
            }
            $rowsAffected = $stmt->rowCount();
            if ($rowsAffected > 0) {
                echo json_encode(['success' => true, 'status' => 'success']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Notification not found, not owned by user, or already read']);
            }
            $conn = null;
            exit;
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $conn->prepare("DELETE FROM notifications WHERE user_id = ?");
            if (!$stmt->execute([$user_id])) {
                $errorInfo = $stmt->errorInfo();
                $errorMsg = "Failed to execute delete: " . json_encode($errorInfo);
                log_error($errorMsg);
                echo json_encode(['success' => false, 'error' => $errorMsg]);
                $conn = null;
                exit;
            }
            echo json_encode(['success' => true, 'status' => 'success']);
            $conn = null;
            exit;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'count') {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        if (!$stmt->execute([$user_id])) {
            $errorInfo = $stmt->errorInfo();
            $errorMsg = "Failed to execute count: " . json_encode($errorInfo);
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

    $validFilters = ['All', 'Unread', 'Read'];
    $validCategories = ['All Categories', 'order', 'system', 'custom', 'message', 'social', 'shopping', 'events', 'account'];
    $validSorts = ['Newest First', 'Oldest First'];

    $filter = isset($_GET['filter']) && in_array($_GET['filter'], $validFilters) ? $_GET['filter'] : 'All';
    $category = isset($_GET['category']) && in_array($_GET['category'], $validCategories) ? $_GET['category'] : 'All Categories';
    $sort = isset($_GET['sort']) && in_array($_GET['sort'], $validSorts) ? $_GET['sort'] : 'Newest First';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 10;

    log_error("Query params: " . json_encode($_GET) . " at " . date('Y-m-d H:i:s'));
    $query = "SELECT * FROM notifications WHERE user_id = ?";
    $params = [$user_id];
    if ($filter === 'Unread') $query .= " AND is_read = 0";
    if ($filter === 'Read') $query .= " AND is_read = 1";
    if ($category !== 'All Categories') {
        $query .= " AND type = ?";
        $params[] = $category;
    }
    $query .= $sort === 'Newest First' ? " ORDER BY created_at DESC" : " ORDER BY created_at ASC";
    $offset = ($page - 1) * $perPage;
    $query .= " LIMIT " . (int)$offset . ", " . (int)$perPage;

    log_error("Executing SQL Query: $query with params: " . json_encode($params) . " at " . date('Y-m-d H:i:s'));
    $stmt = $conn->prepare($query);
    if (!$stmt->execute($params)) {
        $errorInfo = $stmt->errorInfo();
        $errorMsg = "Failed to execute query: " . json_encode($errorInfo);
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }
    log_error("Query executed successfully at " . date('Y-m-d H:i:s'));
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    log_error("Fetched notifications: " . json_encode($notifications) . " at " . date('Y-m-d H:i:s'));

    $totalStmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ?");
    if (!$totalStmt->execute([$user_id])) {
        $errorInfo = $totalStmt->errorInfo();
        $errorMsg = "Failed to execute count query: " . json_encode($errorInfo);
        log_error($errorMsg);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        $conn = null;
        exit;
    }
    $total = $totalStmt->fetchColumn();
    $totalPages = ceil($total / $perPage);
    log_error("Total notifications: $total, Total pages: $totalPages at " . date('Y-m-d H:i:s'));

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'totalPages' => $totalPages
    ]);
} catch (Exception $e) {
    http_response_code(500);
    $errorMsg = "Server error: " . $e->getMessage() . " at " . date('Y-m-d H:i:s');
    log_error($errorMsg);
    echo json_encode(['success' => false, 'error' => $errorMsg]);
    $conn = null;
    exit;
}

$conn = null;
?>