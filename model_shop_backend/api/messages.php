<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    house_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Please log in']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['conversation_id'])) {
        $conversation_id = intval($_GET['conversation_id']);
        try {
            // Validate that conversation_id corresponds to an existing conversation involving the user
            $stmt = $conn->prepare("
                SELECT conversation_id 
                FROM conversations 
                WHERE conversation_id = ? 
                AND (user1_id = ? OR user2_id = ?)
            ");
            $stmt->execute([$conversation_id, $user_id, $user_id]);
            $conversation_exists = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$conversation_exists) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid conversation ID']);
                exit;
            }

            // Get the other user's ID
            $stmt = $conn->prepare("
                SELECT 
                    CASE 
                        WHEN user1_id = ? THEN user2_id 
                        ELSE user1_id 
                    END AS other_user_id
                FROM conversations
                WHERE conversation_id = ?
            ");
            $stmt->execute([$user_id, $conversation_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $other_user_id = $result['other_user_id'] ?? null;

            if (!$other_user_id) {
                throw new PDOException("No other user found for this conversation");
            }

            // Get the other user's name
            $stmt = $conn->prepare("
                SELECT u.full_name AS other_user_name
                FROM users u
                WHERE u.user_id = ?
            ");
            $stmt->execute([$other_user_id]);
            $other_user = $stmt->fetch(PDO::FETCH_ASSOC);
            $other_user_name = $other_user['other_user_name'] ?? 'Unknown';

            // Fetch messages for the conversation
            $stmt = $conn->prepare("
                SELECT m.message_id, m.sender_id, m.content, m.sent_at, m.is_read,
                       u.full_name AS sender_name,
                       mi.media_id, mi.media_url, mi.media_type
                FROM messages m
                JOIN users u ON m.sender_id = u.user_id
                LEFT JOIN messages_imagevid mi ON m.message_id = mi.message_id
                WHERE m.conversation_id = ?
                AND (m.deleted_by IS NULL OR m.deleted_by != ?)
                ORDER BY m.sent_at ASC
            ");
            $stmt->execute([$conversation_id, $user_id]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($messages === false) {
                throw new PDOException("No messages found or query failed");
            }

            // Mark messages as read
            $stmt_update = $conn->prepare("
                UPDATE messages
                SET is_read = TRUE
                WHERE conversation_id = ? 
                AND receiver_id = ? 
                AND is_read = FALSE
            ");
            $stmt_update->execute([$conversation_id, $user_id]);

            // Format messages for response
            $formattedMessages = [];
            foreach ($messages as $msg) {
                $message = [
                    'message_id' => $msg['message_id'],
                    'sender_id' => $msg['sender_id'],
                    'content' => $msg['content'] ?? '',
                    'sent_at' => $msg['sent_at'],
                    'is_read' => (bool)$msg['is_read'],
                    'sender_name' => $msg['sender_name'] ?? 'Unknown',
                    'receiver_name' => $other_user_name
                ];
                if (isset($msg['media_id'])) {
                    $message['media'] = [
                        'media_id' => $msg['media_id'],
                        'media_url' => $msg['media_url'],
                        'media_type' => $msg['media_type']
                    ];
                }
                $formattedMessages[] = $message;
            }

            echo json_encode(['success' => true, 'data' => $formattedMessages, 'other_user_name' => $other_user_name]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch messages: ' . $e->getMessage()]);
        }
    } else {
        try {
            // Fetch all conversations for the user
            $stmt = $conn->prepare("
                SELECT 
                    c.conversation_id AS id,
                    CASE 
                        WHEN c.user1_id = ? THEN c.user2_id 
                        ELSE c.user1_id 
                    END AS other_user_id,
                    u.full_name AS sender,
                    m.sent_at AS sent_at,
                    m.content,
                    (SELECT COUNT(*) 
                     FROM messages m2 
                     WHERE m2.conversation_id = c.conversation_id 
                     AND m2.receiver_id = ? 
                     AND m2.is_read = FALSE) AS unread_count
                FROM conversations c
                LEFT JOIN messages m ON m.message_id = c.last_message_id
                JOIN users u ON u.user_id = (CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END)
                WHERE c.user1_id = ? OR c.user2_id = ?
                ORDER BY m.sent_at DESC
            ");
            $stmt->execute([$user_id, $user_id, $user_id, $user_id, $user_id]);
            $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($conversations === false) {
                $conversations = [];
            }

            log_error("Fetched conversations for user_id $user_id: " . json_encode($conversations));

            foreach ($conversations as &$conv) {
                $conv['time'] = timeAgo($conv['sent_at']);
                $conv['id'] = $conv['id'] ?? 0; // Now using conversation_id
                $conv['other_user_id'] = $conv['other_user_id'] ?? 0;
                $conv['unread_count'] = (int)($conv['unread_count'] ?? 0);
                $conv['content'] = $conv['content'] ?? '';
                $conv['sender'] = $conv['sender'] ?? 'Unknown';
            }

            echo json_encode(['success' => true, 'data' => $conversations]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch conversations: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $receiver_id = isset($_POST['receiver_id']) ? intval($_POST['receiver_id']) : 0;
    $content = sanitize_input($_POST['content'] ?? '');
    $sender_id = isset($_POST['sender_id']) ? intval($_POST['sender_id']) : $user_id;

    if (!$receiver_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Receiver ID is required']);
        exit;
    }

    try {
        $conn->beginTransaction();

        // Check if a conversation exists between the two users
        $stmt = $conn->prepare("
            SELECT conversation_id 
            FROM conversations 
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        ");
        $stmt->execute([$sender_id, $receiver_id, $receiver_id, $sender_id]);
        $conversation = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$conversation) {
            // Create a new conversation
            $stmt = $conn->prepare("
                INSERT INTO conversations (user1_id, user2_id) 
                VALUES (?, ?)
            ");
            $stmt->execute([$sender_id, $receiver_id]);
            $conversation_id = $conn->lastInsertId();
        } else {
            $conversation_id = $conversation['conversation_id'];
        }

        // Check for duplicate message within the last 5 seconds
        $stmt = $conn->prepare("
            SELECT COUNT(*) 
            FROM messages 
            WHERE sender_id = ? 
            AND receiver_id = ? 
            AND content = ? 
            AND sent_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
        ");
        $stmt->execute([$sender_id, $receiver_id, $content]);
        $duplicate_count = $stmt->fetchColumn();

        if ($duplicate_count > 0) {
            throw new Exception("Duplicate message detected. Please wait before sending the same message again.");
        }

        // Insert the message
        $stmt = $conn->prepare("
            INSERT INTO messages (sender_id, receiver_id, conversation_id, content) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$sender_id, $receiver_id, $conversation_id, $content]);
        $message_id = $conn->lastInsertId();

        // Update last_message_id in conversations
        $stmt = $conn->prepare("
            UPDATE conversations 
            SET last_message_id = ? 
            WHERE conversation_id = ?
        ");
        $stmt->execute([$message_id, $conversation_id]);

        // Handle media upload if present
        $media = null;
        if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
            $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
            $max_size = 10 * 1024 * 1024;
            if (!in_array($_FILES['media']['type'], $allowed_types)) {
                throw new Exception('Invalid file type. Only JPEG, PNG, GIF images or MP4 videos are allowed.');
            }
            if ($_FILES['media']['size'] > $max_size) {
                throw new Exception('File size exceeds 10MB limit.');
            }

            $upload_dir = '../Uploads/messages/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }

            $extension = pathinfo($_FILES['media']['name'], PATHINFO_EXTENSION);
            $filename = 'media_' . $message_id . '_' . time() . '.' . $extension;
            $destination = $upload_dir . $filename;

            if (!move_uploaded_file($_FILES['media']['tmp_name'], $destination)) {
                throw new Exception('Failed to upload file.');
            }

            $media_url = 'Uploads/messages/' . $filename;
            $media_type = $_FILES['media']['type'] === 'video/mp4' ? 'video' : 'image';
            $stmt = $conn->prepare("
                INSERT INTO messages_imagevid (message_id, media_url, media_type) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$message_id, $media_url, $media_type]);

            $media = [
                'media_id' => $conn->lastInsertId(),
                'media_url' => $media_url,
                'media_type' => $media_type
            ];
        }

        // Fetch the newly inserted message
        $stmt = $conn->prepare("
            SELECT m.message_id, m.sender_id, m.content, m.sent_at, m.is_read,
                   u.full_name AS sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.message_id = ?
        ");
        $stmt->execute([$message_id]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($media) {
            $message['media'] = $media;
        }

        // Create a notification for the receiver
        $stmt_notify = $conn->prepare("
            INSERT INTO notifications (user_id, message, type, is_read, created_at)
            VALUES (?, ?, 'message', FALSE, ?)
        ");
        $notification_message = "Bạn có tin nhắn mới từ " . $message['sender_name'];
        $stmt_notify->execute([$receiver_id, $notification_message, date('Y-m-d H:i:s')]);

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Message sent', 'data' => $message]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send message: ' . $e->getMessage()]);
    }
}

$conn = null;

function timeAgo($timestamp) {
    if (!$timestamp) return "Just now";
    $time = strtotime($timestamp);
    $now = time();
    $diff = $now - $time;

    if ($diff < 0) {
        return date('h:i A', $time);
    }

    if ($diff < 60) {
        return $diff . " sec. ago";
    } elseif ($diff < 3600) {
        return round($diff / 60) . " min. ago";
    } elseif ($diff < 86400) {
        return date('h:i A', $time);
    } else {
        return date('h:i A', $time);
    }
}
?>