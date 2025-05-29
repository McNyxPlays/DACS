<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

require '../config/database.php';
require '../config/functions.php';

// Function to parse multipart/form-data for PUT requests
function parse_multipart_formdata() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        log_error("No raw input received for multipart/form-data parsing");
        return [[], []];
    }

    $boundary = substr($input, 0, strpos($input, "\r\n"));
    if (empty($boundary)) {
        log_error("Failed to extract boundary from multipart/form-data");
        return [[], []];
    }

    $parts = array_slice(explode($boundary, $input), 1, -1);
    if (empty($parts)) {
        log_error("No parts found in multipart/form-data");
        return [[], []];
    }

    $data = [];
    $files = [];

    foreach ($parts as $part) {
        if (strpos($part, 'Content-Disposition') === false) {
            continue;
        }

        preg_match('/name="([^"]+)"/', $part, $nameMatch);
        $name = $nameMatch[1] ?? '';
        if (empty($name)) {
            log_error("Failed to extract name from part: " . substr($part, 0, 100));
            continue;
        }

        if (preg_match('/filename="([^"]+)"/', $part, $filenameMatch)) {
            $filename = $filenameMatch[1];
            preg_match('/Content-Type: (.*?)\r\n\r\n(.*)$/s', $part, $fileContentMatch);
            $contentType = $fileContentMatch[1] ?? '';
            $content = $fileContentMatch[2] ?? '';

            $content = preg_replace('/\r\n--$/', '', $content);
            if (strlen($content) === 0) {
                log_error("File content is empty for $filename");
                $files[$name] = [
                    'name' => $filename,
                    'type' => $contentType,
                    'tmp_name' => '',
                    'error' => UPLOAD_ERR_NO_FILE,
                    'size' => 0,
                ];
                continue;
            }

            $tmpFile = tempnam(sys_get_temp_dir(), 'php');
            if ($tmpFile === false) {
                log_error("Failed to create temporary file for $filename");
                continue;
            }

            $bytesWritten = file_put_contents($tmpFile, $content);
            if ($bytesWritten === false) {
                log_error("Failed to write content to temporary file for $filename. Error: " . json_encode(error_get_last()));
                continue;
            }

            $files[$name] = [
                'name' => $filename,
                'type' => $contentType,
                'tmp_name' => $tmpFile,
                'error' => UPLOAD_ERR_OK,
                'size' => $bytesWritten,
            ];
        } else {
            preg_match('/\r\n\r\n(.*)\r\n/s', $part, $valueMatch);
            $value = trim($valueMatch[1] ?? '');
            $data[$name] = $value;
        }
    }

    return [$data, $files];
}

$conn = db_connect();
if ($conn === null) {
    http_response_code(500);
    $errorMsg = 'Database connection failed';
    log_error($errorMsg);
    echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    log_error("GET request to user.php, Session: " . json_encode($_SESSION) . " at " . date('Y-m-d H:i:s'));
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        $errorMsg = 'Unauthorized: Please log in';
        log_error($errorMsg);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $conn->prepare("SELECT user_id, email, full_name, phone_number, gender, address, role, is_active, created_at FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $user['phone_number'] = $user['phone_number'] ?? "";
            $user['address'] = $user['address'] ?? "";
            $user['gender'] = $user['gender'] ?? "";
            // Fetch profile image from user_images
            $stmt_image = $conn->prepare("SELECT image_url FROM user_images WHERE user_id = ? AND image_type = 'profile' AND is_active = TRUE LIMIT 1");
            $stmt_image->execute([$user_id]);
            $profile_image = $stmt_image->fetchColumn();
            $user['profile_image'] = $profile_image ?? "";

            http_response_code(200);
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        $errorMsg = 'Error fetching user: ' . $e->getMessage();
        log_error($errorMsg);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        $conn = null;
        exit;
    }

    session_unset();
    session_destroy();
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Logout successful']);
    $conn = null;
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];

    $conn->beginTransaction();

    try {
        log_error("PUT request received at " . date('Y-m-d H:i:s') . ", URI: " . $_SERVER['REQUEST_URI']);
        log_error("Raw POST data: " . file_get_contents("php://input"));

        // Use parse_multipart_formdata to handle both fields and files
        list($formData, $files) = parse_multipart_formdata();
        $profile_image = isset($files['profile_image']) ? $files['profile_image'] : null;

        $stmt = $conn->prepare("SELECT email, password, role, is_active FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $current_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$current_user) {
            throw new Exception('User not found');
        }

        $full_name = sanitize_input($formData['full_name'] ?? '');
        $email = sanitize_input($formData['email'] ?? $current_user['email']);
        $phone_number = sanitize_input($formData['phone_number'] ?? null);
        $gender = sanitize_input($formData['gender'] ?? null);
        $address = sanitize_input($formData['address'] ?? null);
        $role = $current_user['role'];
        $is_active = $current_user['is_active'];
        $current_password = $formData['current_password'] ?? '';
        $new_password = $formData['new_password'] ?? '';
        $remove_profile_image = isset($formData['remove_profile_image']) && $formData['remove_profile_image'] === 'true';

        log_error("Received data in PUT request: full_name=$full_name, email=$email, phone_number=$phone_number, gender=$gender, address=$address, role=$role, is_active=$is_active, profile_image=" . ($profile_image ? json_encode($profile_image) : 'null') . ", remove_profile_image=$remove_profile_image");

        if (empty($full_name)) {
            throw new Exception('Display name is required');
        }

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Valid email is required');
        }

        if ($email !== $current_user['email']) {
            $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
            $stmt->execute([$email, $user_id]);
            if ($stmt->fetch()) {
                throw new Exception('Email already exists');
            }
        }

        if ($phone_number && !preg_match('/^\+?\d{10,15}$/', $phone_number)) {
            throw new Exception('Invalid phone number format (must be 10-15 digits, optionally starting with +)');
        }

        // Handle profile image upload
        if ($profile_image && $profile_image['error'] === UPLOAD_ERR_OK) {
            $maxFileSize = 5 * 1024 * 1024; // 5MB
            if ($profile_image['size'] > $maxFileSize) {
                throw new Exception('Profile image size exceeds 5MB limit');
            }

            $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($profile_image['type'], $allowed_types)) {
                throw new Exception('Only JPEG, PNG, and GIF images are allowed');
            }

            $upload_dir = realpath(__DIR__ . '/../Uploads/avatars') . '/';
            if (!file_exists($upload_dir)) {
                if (!mkdir($upload_dir, 0777, true)) {
                    log_error("Failed to create upload directory: $upload_dir. Error: " . json_encode(error_get_last()));
                    throw new Exception('Failed to create upload directory');
                }
            }

            if (!is_writable($upload_dir)) {
                log_error("Upload directory is not writable: $upload_dir. Permissions: " . substr(sprintf('%o', fileperms($upload_dir)), -4));
                throw new Exception('Upload directory is not writable');
            }

            $file_name = uniqid('avatar_') . '.' . strtolower(pathinfo($profile_image['name'], PATHINFO_EXTENSION));
            $target_file = $upload_dir . $file_name;
            log_error("Attempting to move file from " . $profile_image['tmp_name'] . " to $target_file");

            if (!file_exists($profile_image['tmp_name'])) {
                log_error("Temporary file does not exist: " . $profile_image['tmp_name']);
                throw new Exception('Temporary file not found');
            }
            if (!is_readable($profile_image['tmp_name'])) {
                log_error("Temporary file is not readable: " . $profile_image['tmp_name']);
                throw new Exception('Cannot read temporary file');
            }

            if (move_uploaded_file($profile_image['tmp_name'], $target_file)) {
                // Remove existing profile image if it exists
                $stmt_existing = $conn->prepare("SELECT image_id, image_url FROM user_images WHERE user_id = ? AND image_type = 'profile' AND is_active = TRUE");
                $stmt_existing->execute([$user_id]);
                $existing_image = $stmt_existing->fetch(PDO::FETCH_ASSOC);
                if ($existing_image) {
                    $old_file_path = realpath(__DIR__ . '/../') . '/' . $existing_image['image_url'];
                    if (file_exists($old_file_path)) {
                        unlink($old_file_path);
                        log_error("Removed old profile image: " . $old_file_path);
                        // Soft delete the old image record
                        $stmt_delete = $conn->prepare("UPDATE user_images SET is_active = FALSE WHERE image_id = ?");
                        $stmt_delete->execute([$existing_image['image_id']]);
                    }
                }
                // Insert new profile image
                $stmt_insert = $conn->prepare("INSERT INTO user_images (user_id, image_url, image_type, is_active) VALUES (?, ?, 'profile', TRUE)");
                $stmt_insert->execute([$user_id, 'Uploads/avatars/' . $file_name]);
                log_error("File successfully moved to $target_file");
            } else {
                $error = error_get_last();
                log_error("Failed to move file from " . $profile_image['tmp_name'] . " to $target_file. Error: " . json_encode($error));
                if (!is_writable($upload_dir)) {
                    log_error("Upload directory became unwritable: $upload_dir");
                }
                if (!file_exists($upload_dir)) {
                    log_error("Upload directory no longer exists: $upload_dir");
                }
                throw new Exception('Failed to upload image: Unable to move file to destination');
            }
        } elseif ($remove_profile_image) {
            // Remove existing profile image
            $stmt_existing = $conn->prepare("SELECT image_id, image_url FROM user_images WHERE user_id = ? AND image_type = 'profile' AND is_active = TRUE");
            $stmt_existing->execute([$user_id]);
            $existing_image = $stmt_existing->fetch(PDO::FETCH_ASSOC);
            if ($existing_image) {
                $old_file_path = realpath(__DIR__ . '/../') . '/' . $existing_image['image_url'];
                if (file_exists($old_file_path)) {
                    unlink($old_file_path);
                    log_error("Removed existing profile image: " . $old_file_path);
                }
                $stmt_delete = $conn->prepare("UPDATE user_images SET is_active = FALSE WHERE image_id = ?");
                $stmt_delete->execute([$existing_image['image_id']]);
            }
        }

        $password_sql = '';
        $password_params = [];
        if ($current_password && $new_password) {
            if (!password_verify($current_password, $current_user['password'])) {
                throw new Exception('Current password is incorrect');
            }
            $password_sql = ', password = ?';
            $password_params = [password_hash($new_password, PASSWORD_DEFAULT)];
        }

        $sql = "UPDATE users SET full_name = ?, email = ?, phone_number = ?, gender = ?, address = ?, role = ?, is_active = ? $password_sql WHERE user_id = ?";
        $params = array_merge([$full_name, $email, $phone_number, $gender, $address, $role, $is_active], $password_params, [$user_id]);
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        $stmt = $conn->prepare("SELECT user_id, email, full_name, phone_number, gender, address, role, is_active, created_at FROM users WHERE user_id = ? AND is_active = TRUE");
        $stmt->execute([$user_id]);
        $updated_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($updated_user) {
            $updated_user['phone_number'] = $updated_user['phone_number'] ?? "";
            $updated_user['address'] = $updated_user['address'] ?? "";
            $updated_user['gender'] = $updated_user['gender'] ?? "";
            // Fetch updated profile image
            $stmt_image = $conn->prepare("SELECT image_url FROM user_images WHERE user_id = ? AND image_type = 'profile' AND is_active = TRUE LIMIT 1");
            $stmt_image->execute([$user_id]);
            $profile_image = $stmt_image->fetchColumn();
            $updated_user['profile_image'] = $profile_image ?? "";

            $conn->commit();
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => $profile_image ? 'Profile updated with new image' : 'Profile updated successfully',
                'user' => $updated_user
            ]);
        } else {
            throw new Exception('User not found or no changes made');
        }
    } catch (Exception $e) {
        $conn->rollBack();
        $errorMsg = $e->getMessage();
        log_error("PUT request error: $errorMsg, Stack trace: " . $e->getTraceAsString());
        http_response_code($errorMsg === 'Failed to upload image: Unable to move file to destination' ? 500 : 400);
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please log in']);
        $conn = null;
        exit;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $stmt = $conn->prepare("UPDATE users SET is_active = FALSE WHERE user_id = ?");
        $stmt->execute([$user_id]);

        if ($stmt->rowCount() > 0) {
            session_unset();
            session_destroy();
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'User account deactivated']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Deletion failed: ' . $e->getMessage()]);
    }
}

$conn = null;
?>