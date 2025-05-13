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

function validateInput($data) {
    return [
        'title' => sanitize_input($data['title'] ?? ''),
        'content' => sanitize_input($data['content'] ?? ''),
        'status' => sanitize_input($data['status'] ?? 'new'),
        'category_id' => filter_var($data['category_id'] ?? null, FILTER_VALIDATE_INT) ?: null
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = $_POST;
    $validated = validateInput($data);
    $images = $_FILES['images'] ?? null;

    if (empty($validated['title']) || empty($validated['content'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Title and content are required']);
        exit;
    }

    if (!in_array($validated['status'], ['new', 'used', 'custom'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            "INSERT INTO posts (user_id, category_id, title, content, status, is_approved) 
             VALUES (?, ?, ?, ?, ?, FALSE)"
        );
        $stmt->execute([
            $user_id,
            $validated['category_id'],
            $validated['title'],
            $validated['content'],
            $validated['status']
        ]);
        $post_id = $pdo->lastInsertId();

        $image_urls = [];
        if ($images && is_array($images['name'])) {
            $upload_dir = '../Uploads/posts/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            foreach ($images['name'] as $index => $name) {
                if ($images['error'][$index] === UPLOAD_ERR_OK) {
                    $file_name = uniqid() . '_' . basename($name);
                    $target_file = $upload_dir . $file_name;
                    if (move_uploaded_file($images['tmp_name'][$index], $target_file)) {
                        $image_url = 'Uploads/posts/' . $file_name;
                        $stmt = $pdo->prepare(
                            "INSERT INTO post_images (post_id, image_url) VALUES (?, ?)"
                        );
                        $stmt->execute([$post_id, $image_url]);
                        $image_urls[] = $image_url;
                    }
                }
            }
        }

        $pdo->commit();
        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => 'Post created successfully',
            'post' => [
                'post_id' => $post_id,
                'user_id' => $user_id,
                'title' => $validated['title'],
                'content' => $validated['content'],
                'status' => $validated['status'],
                'category_id' => $validated['category_id'],
                'images' => $image_urls,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error creating post: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $action = $_GET['action'] ?? '';

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $post_id = filter_var($data['post_id'] ?? 0, FILTER_VALIDATE_INT);

    if (!$post_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid post ID']);
        exit;
    }

    try {
        if ($action === 'like') {
            $stmt = $pdo->prepare("SELECT wishlist_id FROM wishlists WHERE user_id = ? AND post_id = ?");
            $stmt->execute([$user_id, $post_id]);
            $existing_wishlist = $stmt->fetch();

            if ($existing_wishlist) {
                $stmt = $pdo->prepare("DELETE FROM wishlists WHERE user_id = ? AND post_id = ?");
                $stmt->execute([$user_id, $post_id]);
                $message = 'Post unliked successfully';
            } else {
                $stmt = $pdo->prepare("INSERT INTO wishlists (user_id, post_id) VALUES (?, ?)");
                $stmt->execute([$user_id, $post_id]);
                $message = 'Post liked successfully';
            }

            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM wishlists WHERE post_id = ?");
            $stmt->execute([$post_id]);
            $like_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => $message,
                'liked' => !$existing_wishlist,
                'like_count' => $like_count
            ]);
        } elseif ($action === 'comment') {
            $content = sanitize_input($data['content'] ?? '');

            if (empty($content)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Comment content is required']);
                exit;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)"
            );
            $stmt->execute([$user_id, $post_id, $content]);
            $comment_id = $pdo->lastInsertId();

            $stmt = $pdo->prepare(
                "SELECT c.comment_id, c.content, c.created_at, u.full_name, u.profile_image 
                 FROM comments c 
                 JOIN users u ON c.user_id = u.user_id 
                 WHERE c.comment_id = ?"
            );
            $stmt->execute([$comment_id]);
            $comment = $stmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Comment added successfully',
                'comment' => $comment
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error processing request: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = filter_var($_GET['limit'] ?? 10, FILTER_VALIDATE_INT) ?: 10;
    $offset = filter_var($_GET['offset'] ?? 0, FILTER_VALIDATE_INT) ?: 0;

    try {
        $stmt = $pdo->prepare(
            "SELECT p.post_id, p.user_id, p.title, p.content, p.status, p.created_at, 
                    p.category_id, u.full_name, u.profile_image,
                    (SELECT COUNT(*) FROM wishlists w WHERE w.post_id = p.post_id) as like_count,
                    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comment_count
             FROM posts p 
             JOIN users u ON p.user_id = u.user_id 
             WHERE p.is_approved = TRUE 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?"
        );
        $stmt->execute([$limit, $offset]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($posts as &$post) {
            $stmt = $pdo->prepare("SELECT image_url FROM post_images WHERE post_id = ?");
            $stmt->execute([$post['post_id']]);
            $post['images'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (isset($_SESSION['user_id'])) {
                $stmt = $pdo->prepare("SELECT wishlist_id FROM wishlists WHERE user_id = ? AND post_id = ?");
                $stmt->execute([$_SESSION['user_id'], $post['post_id']]);
                $post['is_liked'] = !!$stmt->fetch();
            } else {
                $post['is_liked'] = false;
            }
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'posts' => $posts
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error fetching posts: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>