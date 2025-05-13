<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
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
        $stmt = $pdo->prepare("SELECT skill_id, skill_name FROM user_skills WHERE user_id = ? ORDER BY created_at ASC");
        $stmt->execute([$user_id]);
        $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(['status' => 'success', 'skills' => $skills]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error fetching skills: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $skill_name = sanitize_input($data['skill_name'] ?? '');

    if (empty($skill_name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Skill name is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)");
        $stmt->execute([$user_id, $skill_name]);
        $skill_id = $pdo->lastInsertId();
        http_response_code(201);
        echo json_encode(['status' => 'success', 'skill' => ['skill_id' => $skill_id, 'skill_name' => $skill_name]]);
    } catch (PDOException $e) {
        if ($e->getCode() == '23000') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Skill already exists']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error adding skill: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $skill_id = $data['skill_id'] ?? null;

    if (empty($skill_id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Skill ID is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM user_skills WHERE skill_id = ? AND user_id = ?");
        $stmt->execute([$skill_id, $user_id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Skill deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Skill not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error deleting skill: ' . $e->getMessage()]);
    }
}
?>