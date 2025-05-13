<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT link_id, platform, link_url, display_name FROM user_social_links WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $social_links = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'social_links' => $social_links]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error fetching social links: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $platform = sanitize_input($data['platform'] ?? '');
    $link_url = sanitize_input($data['link_url'] ?? '');
    $display_name = sanitize_input($data['display_name'] ?? '');

    if (empty($platform) || empty($link_url) || empty($display_name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO user_social_links (user_id, platform, link_url, display_name) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $platform, $link_url, $display_name]);
        $link_id = $pdo->lastInsertId();
        http_response_code(201);
        echo json_encode(['status' => 'success', 'social_link' => [
            'link_id' => $link_id,
            'platform' => $platform,
            'link_url' => $link_url,
            'display_name' => $display_name
        ]]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error adding social link: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $link_id = $data['link_id'] ?? null;
    $platform = sanitize_input($data['platform'] ?? '');
    $link_url = sanitize_input($data['link_url'] ?? '');
    $display_name = sanitize_input($data['display_name'] ?? '');

    if (empty($link_id) || empty($platform) || empty($link_url) || empty($display_name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE user_social_links SET platform = ?, link_url = ?, display_name = ? WHERE link_id = ? AND user_id = ?");
        $stmt->execute([$platform, $link_url, $display_name, $link_id, $user_id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'social_link' => [
                'link_id' => $link_id,
                'platform' => $platform,
                'link_url' => $link_url,
                'display_name' => $display_name
            ]]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Social link not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error updating social link: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $link_id = $data['link_id'] ?? null;

    if (empty($link_id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Link ID is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM user_social_links WHERE link_id = ? AND user_id = ?");
        $stmt->execute([$link_id, $user_id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Social link deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Social link not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error deleting social link: ' . $e->getMessage()]);
    }
}
?>