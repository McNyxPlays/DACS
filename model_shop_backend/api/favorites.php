<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            if ($user_id > 0) {
                $query = "SELECT f.favorite_id, p.product_id, p.name, p.price, pi.image_url
                          FROM favorites f
                          JOIN products p ON f.product_id = p.product_id
                          LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_main = 1
                          WHERE f.user_id = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $favorites = [];
                while ($row = $result->fetch_assoc()) {
                    $favorites[] = $row;
                }
                echo json_encode(["status" => "success", "favorites" => $favorites]);
                $stmt->close();
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid user ID"]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
            $product_id = isset($data['product_id']) ? intval($data['product_id']) : 0;

            if ($user_id <= 0 || $product_id <= 0) {
                echo json_encode(["status" => "error", "message" => "Invalid input: user_id or product_id is invalid"]);
                break;
            }

            // Kiểm tra sản phẩm tồn tại
            $query = "SELECT product_id FROM products WHERE product_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $product_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                echo json_encode(["status" => "error", "message" => "Product not found"]);
                $stmt->close();
                break;
            }
            $stmt->close();

            // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích
            $query = "SELECT favorite_id FROM favorites WHERE user_id = ? AND product_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ii", $user_id, $product_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                echo json_encode(["status" => "error", "message" => "Product already in favorites"]);
                $stmt->close();
                break;
            }
            $stmt->close();

            // Thêm vào danh sách yêu thích
            $query = "INSERT INTO favorites (user_id, product_id) VALUES (?, ?)";
            $stmt = $conn->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare statement failed: " . $conn->error);
            }
            $stmt->bind_param("ii", $user_id, $product_id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "favorite_id" => $conn->insert_id]);
            } else {
                throw new Exception("Failed to add to favorites: " . $stmt->error);
            }
            $stmt->close();
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"), true);
            $favorite_id = isset($data['favorite_id']) ? intval($data['favorite_id']) : 0;
            $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;

            if ($favorite_id <= 0 || $user_id <= 0) {
                echo json_encode(["status" => "error", "message" => "Invalid input: favorite_id or user_id is invalid"]);
                break;
            }

            $query = "DELETE FROM favorites WHERE favorite_id = ? AND user_id = ?";
            $stmt = $conn->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare statement failed: " . $conn->error);
            }
            $stmt->bind_param("ii", $favorite_id, $user_id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            } else {
                throw new Exception("Failed to remove from favorites: " . $stmt->error);
            }
            $stmt->close();
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}

$conn->close();
?>