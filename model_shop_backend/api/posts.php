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

    if (empty($validated['content'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Content is required']);
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
            "INSERT INTO posts (user_id, content, post_time_status, is_approved) 
             VALUES (?, ?, ?, TRUE)"
        );
        $stmt->execute([
            $user_id,
            $validated['content'],
            $validated['post_time_status']
        ]);
        $post_id = $pdo->lastInsertId();

        $image_urls = [];
        if ($images && is_array($images['name'])) {
            $upload_dir = '../Uploads/posts/';
            if (!file_exists($upload_dir)) {
                if (!mkdir($upload_dir, 0755, true)) {
                    throw new Exception("Failed to create upload directory: $upload_dir");
                }
            }

            if (!is_writable($upload_dir)) {
                throw new Exception("Upload directory is not writable: $upload_dir");
            }

            foreach ($images['name'] as $index => $name) {
                if ($images['error'][$index] === UPLOAD_ERR_OK) {
                    $file_extension = pathinfo($name, PATHINFO_EXTENSION);
                    $file_base = pathinfo($name, PATHINFO_FILENAME);
                    $file_base = preg_replace('/^download_/', '', $file_base);
                    $file_base = preg_replace('/[^a-zA-Z0-9_-]/', '_', $file_base);
                    $file_name = uniqid() . '_' . $file_base . '.' . $file_extension;
                    $target_file = $upload_dir . $file_name;

                    error_log("Uploading file: {$images['tmp_name'][$index]} to $target_file");

                    if (move_uploaded_file($images['tmp_name'][$index], $target_file)) {
                        $image_url = 'Uploads/posts/' . $file_name;
                        $stmt = $pdo->prepare(
                            "INSERT INTO post_images (post_id, image_url) VALUES (?, ?)"
                        );
                        $stmt->execute([$post_id, $image_url]);
                        $image_urls[] = $image_url;

                        if (!file_exists($target_file)) {
                            error_log("File not found after move: $target_file");
                        } else {
                            error_log("File successfully uploaded: $target_file");
                        }
                    } else {
                        error_log("Failed to move file: {$images['tmp_name'][$index]} to $target_file");
                        throw new Exception("Failed to move uploaded file: $name");
                    }
                } elseif ($images['error'][$index] !== UPLOAD_ERR_NO_FILE) {
                    error_log("Upload error for file $name: " . $images['error'][$index]);
                    throw new Exception("File upload error: " . $images['error'][$index]);
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
            "SELECT full_name FROM users WHERE user_id = ?"
        );
        $stmt->execute([$user_id]);
        $user_info = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt_image = $pdo->prepare(
            "SELECT image_url FROM user_images WHERE user_id = ? AND image_type = 'profile' AND is_active = TRUE LIMIT 1"
        );
        $stmt_image->execute([$user_id]);
        $profile_image = $stmt_image->fetchColumn();

        $pdo->commit();
        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => 'Post created successfully',
            'post' => [
                'post_id' => $post_id,
                'user_id' => $user_id,
                'content' => $validated['content'],
                'post_time_status' => $validated['post_time_status'],
                'images' => $image_urls,
                'created_at' => date('Y-m-d H:i:s'),
                'like_count' => $like_count,
                'comment_count' => 0,
                'is_liked' => $is_liked,
                'full_name' => $user_info['full_name'] ?? 'Unknown User',
                'profile_image' => $profile_image ?: null
            ]
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error creating post: " . $e->getMessage());
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
                "SELECT c.comment_id, c.content, c.created_at, u.full_name
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
    $user_id_param = $_GET['user_id'] ?? '';

    $limit = (int)$limit;
    $offset = (int)$offset;

    error_log("Limit: $limit, Offset: $offset, User ID Param: $user_id_param");

    try {
        $query = "
            SELECT p.post_id, p.user_id, p.content, p.post_time_status, p.created_at, 
                   u.full_name,
                   (SELECT image_url FROM user_images WHERE user_id = p.user_id AND image_type = 'profile' AND is_active = TRUE LIMIT 1) as profile_image,
                   (SELECT COUNT(*) FROM likes w WHERE w.post_id = p.post_id) as like_count,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comment_count
            FROM posts p 
            JOIN users u ON p.user_id = u.user_id 
            WHERE p.is_approved = TRUE
        ";
        $params = [];

        if ($user_id_param === 'current' && isset($_SESSION['user_id'])) {
            $query .= " AND p.user_id = ?";
            $params[] = $_SESSION['user_id'];
        } elseif ($user_id_param && is_numeric($user_id_param)) {
            $query .= " AND p.user_id = ?";
            $params[] = (int)$user_id_param;
        }

        $query .= " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($posts as &$post) {
            $stmt = $pdo->prepare("SELECT image_url FROM post_images WHERE post_id = ? ORDER BY image_id ASC");
            $stmt->execute([$post['post_id']]);
            $images = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $post['images'] = !empty($images) ? $images : [];

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
        error_log("Error fetching posts: " . $e->getMessage());
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

        $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$post || $post['user_id'] !== $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden: You are not the author of this post']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT image_url FROM post_images WHERE post_id = ?");
        $stmt->execute([$post_id]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($images as $image) {
            $file_path = '../' . $image['image_url'];
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }

        $stmt = $pdo->prepare("DELETE FROM post_images WHERE post_id = ?");
        $stmt->execute([$post_id]);

        $stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ?");
        $stmt->execute([$post_id]);

        $stmt = $pdo->prepare("DELETE FROM comments WHERE post_id = ?");
        $stmt->execute([$post_id]);

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