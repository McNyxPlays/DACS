<?php
header('Content-Type: application/json');
require '../config/database.php';

$filter = $_GET['filter'] ?? 'All';
$category = $_GET['category'] ?? 'All Categories';
$sort = $_GET['sort'] ?? 'Newest First';
$page = $_GET['page'] ?? 1;
$perPage = 10;

$query = "SELECT * FROM notifications WHERE user_id = ?"; // Assume user_id from session
if ($filter === 'Unread') $query .= " AND read = 0";
if ($filter === 'Read') $query .= " AND read = 1";
if ($category !== 'All Categories') $query .= " AND category = ?";
$query .= $sort === 'Newest First' ? " ORDER BY created_at DESC" : " ORDER BY created_at ASC";
$query .= " LIMIT ?, ?";

// Execute query with PDO, paginate results
// Return JSON: { notifications: [...], totalPages: X }
?>