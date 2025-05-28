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
        'post_time_status' => sanitize_input($data['post_time_status'] ?? 'new')
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

    if (!in_array($validated['post_time_status'], ['new', 'recent', 'old'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid post time status']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            "INSERT INTO posts (user_id, title, content, post_time_status, is_approved) 
             VALUES (?, ?, ?, ?, TRUE)"
        );
        $stmt->execute([
            $user_id,
            $validated['title'],
            $validated['content'],
            $validated['post_time_status']
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
                    } else {
                        throw new Exception("Failed to move uploaded file: $name");
                    }
                }
            }
        }

        $stmt = $pdo->prepare(
            "SELECT COUNT(*) as count FROM likes WHERE post_id = ?"
        );
        $stmt->execute([$post_id]);
        $like_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        $is_liked = false;
        if (isset($_SESSION['user_id'])) {
            $stmt = $pdo->prepare(
                "SELECT like_id FROM likes WHERE user_id = ? AND post_id = ?"
            );
            $stmt->execute([$_SESSION['user_id'], $post_id]);
            $is_liked = !!$stmt->fetch();
        }

        $stmt = $pdo->prepare(
            "SELECT full_name, profile_image FROM users WHERE user_id = ?"
        );
        $stmt->execute([$user_id]);
        $user_info = $stmt->fetch(PDO::FETCH_ASSOC);

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
                'post_time_status' => $validated['post_time_status'],
                'images' => $image_urls,
                'created_at' => date('Y-m-d H:i:s'),
                'like_count' => $like_count,
                'comment_count' => 0,
                'is_liked' => $is_liked,
                'full_name' => $user_info['full_name'] ?? 'Unknown User',
                'profile_image' => $user_info['profile_image']
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
            $stmt = $pdo->prepare("SELECT like_id FROM likes WHERE user_id = ? AND post_id = ?");
            $stmt->execute([$user_id, $post_id]);
            $existing_like = $stmt->fetch();

            if ($existing_like) {
                $stmt = $pdo->prepare("DELETE FROM likes WHERE user_id = ? AND post_id = ?");
                $stmt->execute([$user_id, $post_id]);
                $message = 'Post unliked successfully';
            } else {
                $stmt = $pdo->prepare("INSERT INTO likes (user_id, post_id) VALUES (?, ?)");
                $stmt->execute([$user_id, $post_id]);
                $message = 'Post liked successfully';
            }

            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM likes WHERE post_id = ?");
            $stmt->execute([$post_id]);
            $like_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => $message,
                'liked' => !$existing_like,
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

    $limit = (int)$limit;
    $offset = (int)$offset;

    error_log("Limit: $limit, Offset: $offset");

    try {
        $stmt = $pdo->prepare(
            "SELECT p.post_id, p.user_id, p.title, p.content, p.post_time_status, p.created_at, 
                    u.full_name, u.profile_image,
                    (SELECT COUNT(*) FROM likes w WHERE w.post_id = p.post_id) as like_count,
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
            if (isset($_SESSION['user_id'])) {
                $stmt = $pdo->prepare("SELECT like_id FROM likes WHERE user_id = ? AND post_id = ?");
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
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        exit;
    }

    $post_id = filter_var($_GET['post_id'] ?? 0, FILTER_VALIDATE_INT);

    if (!$post_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid post ID']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Kiểm tra xem người dùng có phải là tác giả của bài viết không
        $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$post || $post['user_id'] !== $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden: You are not the author of this post']);
            exit;
        }

        // Xóa các hình ảnh liên quan
        $stmt = $pdo->prepare("DELETE FROM post_images WHERE post_id = ?");
        $stmt->execute([$post_id]);

        // Xóa bài viết
        $stmt = $pdo->prepare("DELETE FROM posts WHERE post_id = ?");
        $stmt->execute([$post_id]);

        $pdo->commit();
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Post deleted successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error deleting post: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>