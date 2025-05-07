<?php
require_once '../config/database.php';
require_once '../config/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$conn = db_connect();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log errors to a file for debugging
function logError($message, $query = null, $params = null) {
    $logFile = '../logs/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    if ($query) {
        $logMessage .= "\nQuery: $query";
        if ($params) {
            $logMessage .= "\nParams: " . json_encode($params);
        }
    }
    $logMessage .= "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'categories':
                try {
                    $stmt = $conn->prepare("
                        SELECT c.category_id, c.name, COUNT(p.product_id) as product_count
                        FROM categories c
                        LEFT JOIN products p ON c.category_id = p.category_id
                        GROUP BY c.category_id, c.name
                    ");
                    $stmt->execute();
                    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode(['status' => 'success', 'data' => $categories]);
                } catch (PDOException $e) {
                    logError('Failed to fetch categories: ' . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch categories']);
                }
                break;

            case 'brands':
                try {
                    $stmt = $conn->prepare("
                        SELECT b.brand_id, b.name, COUNT(p.product_id) as product_count
                        FROM brands b
                        LEFT JOIN products p ON b.brand_id = p.brand_id
                        GROUP BY b.brand_id, b.name
                    ");
                    $stmt->execute();
                    $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode(['status' => 'success', 'data' => $brands]);
                } catch (PDOException $e) {
                    logError('Failed to fetch brands: ' . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch brands']);
                }
                break;

            case 'product':
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                if ($id <= 0) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid product ID']);
                    exit;
                }
                try {
                    $stmt = $conn->prepare("
                        SELECT p.product_id, p.name, p.description, p.price, p.status, p.stock_quantity, p.discount,
                               c.name as category_name, b.name as brand_name,
                               p.created_at
                        FROM products p
                        LEFT JOIN categories c ON p.category_id = c.category_id
                        LEFT JOIN brands b ON p.brand_id = b.brand_id
                        WHERE p.product_id = ?
                    ");
                    $stmt->execute([$id]);
                    $product = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($product) {
                        $images = [];
                        try {
                            $stmt = $conn->prepare("
                                SELECT image_url
                                FROM product_images
                                WHERE product_id = ?
                                ORDER BY is_main DESC, image_id ASC
                            ");
                            $stmt->execute([$id]);
                            $imgs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            foreach ($imgs as $img) {
                                $images[] = '/Uploads/' . $img['image_url'];
                            }
                            if (empty($images)) {
                                $images[] = '/placeholder.jpg';
                            }
                        } catch (PDOException $e) {
                            logError('Failed to fetch images: ' . $e->getMessage());
                            $images[] = '/placeholder.jpg';
                        }
                        $product['images'] = $images;

                        if ($product['stock_quantity'] <= 0) {
                            $product['badge'] = 'Out of Stock';
                            $product['badgeColor'] = 'bg-red-500';
                        } elseif ($product['discount'] > 0) {
                            $product['badge'] = 'On Sale';
                            $product['badgeColor'] = 'bg-green-500';
                        } elseif (strtotime($product['created_at']) >= strtotime('-30 days')) {
                            $product['badge'] = 'New Arrival';
                            $product['badgeColor'] = 'bg-primary';
                        } else {
                            $product['badge'] = null;
                            $product['badgeColor'] = null;
                        }

                        $product['created_at'] = date('c', strtotime($product['created_at']));

                        echo json_encode(['status' => 'success', 'data' => $product]);
                    } else {
                        http_response_code(404);
                        echo json_encode(['status' => 'error', 'message' => 'Product not found']);
                    }
                } catch (PDOException $e) {
                    logError('Failed to fetch product: ' . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch product: ' . $e->getMessage()]);
                }
                break;

            default:
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
                break;
        }
    } else {
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        $category_ids = isset($_GET['category_ids']) ? explode(',', $_GET['category_ids']) : [];
        $brand_ids = isset($_GET['brand_ids']) ? explode(',', $_GET['brand_ids']) : [];
        $status_new = isset($_GET['status_new']) ? filter_var($_GET['status_new'], FILTER_VALIDATE_BOOLEAN) : false;
        $status_available = isset($_GET['status_available']) ? filter_var($_GET['status_available'], FILTER_VALIDATE_BOOLEAN) : false;
        $status_sale = isset($_GET['status_sale']) ? filter_var($_GET['status_sale'], FILTER_VALIDATE_BOOLEAN) : false;
        $sort = isset($_GET['sort']) ? $_GET['sort'] : 'popularity';
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = 12;
        $offset = ($page - 1) * $limit;

        $validSorts = ['price_low', 'price_high', 'newest', 'popularity'];
        $sort = in_array($sort, $validSorts) ? $sort : 'popularity';

        try {
            // Precompute popularity scores
            $popularityQuery = "
                SELECT product_id, COUNT(*) as popularity_score
                FROM order_details
                GROUP BY product_id
            ";
            $popularityStmt = $conn->prepare($popularityQuery);
            $popularityStmt->execute();
            $popularityData = $popularityStmt->fetchAll(PDO::FETCH_ASSOC);
            $popularityMap = [];
            foreach ($popularityData as $row) {
                $popularityMap[$row['product_id']] = $row['popularity_score'];
            }

            // Main query
            $query = "
                SELECT p.product_id, p.name, p.description, p.price, p.status, p.stock_quantity, p.discount,
                       c.name as category_name, b.name as brand_name,
                       p.created_at,
                       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1) as image_url,
                       (SELECT COUNT(*) FROM order_details od WHERE od.product_id = p.product_id) as popularity_score
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                LEFT JOIN brands b ON p.brand_id = b.brand_id
                WHERE p.name LIKE ?
            ";
            $params = [$search];

            if (!empty($category_ids) && $category_ids[0] !== '') {
                $placeholders = implode(',', array_fill(0, count($category_ids), '?'));
                $query .= " AND p.category_id IN ($placeholders)";
                $params = array_merge($params, array_map('intval', $category_ids));
            }

            if (!empty($brand_ids) && $brand_ids[0] !== '') {
                $placeholders = implode(',', array_fill(0, count($brand_ids), '?'));
                $query .= " AND p.brand_id IN ($placeholders)";
                $params = array_merge($params, array_map('intval', $brand_ids));
            }

            // Filter by status
            $statusConditions = [];
            if ($status_new) {
                $statusConditions[] = "p.status = 'new'";
            }
            if ($status_available) {
                $statusConditions[] = "p.status = 'available'";
            }
            if ($status_sale) {
                $statusConditions[] = "p.status = 'sale'";
            }
            if (!empty($statusConditions)) {
                $query .= " AND (" . implode(" OR ", $statusConditions) . ")";
            }

            // Apply sorting
            switch ($sort) {
                case 'price_low':
                    $query .= " ORDER BY p.price ASC";
                    break;
                case 'price_high':
                    $query .= " ORDER BY p.price DESC";
                    break;
                case 'newest':
                    $query .= " ORDER BY p.created_at DESC";
                    break;
                case 'popularity':
                default:
                    $query .= " ORDER BY (
                        SELECT COUNT(*)
                        FROM order_details od
                        WHERE od.product_id = p.product_id
                    ) DESC";
                    break;
            }

            $count_query = "
                SELECT COUNT(*) as total
                FROM products p
                WHERE p.name LIKE ?
            ";
            $count_params = [$search];

            if (!empty($category_ids) && $category_ids[0] !== '') {
                $placeholders = implode(',', array_fill(0, count($category_ids), '?'));
                $count_query .= " AND p.category_id IN ($placeholders)";
                $count_params = array_merge($count_params, array_map('intval', $category_ids));
            }

            if (!empty($brand_ids) && $brand_ids[0] !== '') {
                $placeholders = implode(',', array_fill(0, count($brand_ids), '?'));
                $count_query .= " AND p.brand_id IN ($placeholders)";
                $count_params = array_merge($count_params, array_map('intval', $brand_ids));
            }

            if (!empty($statusConditions)) {
                $count_query .= " AND (" . implode(" OR ", $statusConditions) . ")";
            }

            $stmt = $conn->prepare($count_query);
            $stmt->execute($count_params);
            $total_products = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            $total_pages = ceil($total_products / $limit);

            // Append LIMIT and OFFSET as literals
            $query .= " LIMIT $limit OFFSET $offset";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);

            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch images for each product
            foreach ($products as &$product) {
                try {
                    $stmt = $conn->prepare("
                        SELECT image_url
                        FROM product_images
                        WHERE product_id = ?
                        ORDER BY is_main DESC, image_id ASC
                    ");
                    $stmt->execute([$product['product_id']]);
                    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $product['images'] = array_map(function($img) {
                        return '/Uploads/' . $img['image_url'];
                    }, $images);
                    if (empty($product['images'])) {
                        $product['images'] = ['/placeholder.jpg'];
                    }
                } catch (PDOException $e) {
                    logError('Failed to fetch images for product ' . $product['product_id'] . ': ' . $e->getMessage());
                    $product['images'] = ['/placeholder.jpg'];
                }
                $product['image'] = $product['images'][0];
                unset($product['image_url']);
                $product['popularity_score'] = isset($popularityMap[$product['product_id']])
                    ? $popularityMap[$product['product_id']]
                    : 0;

                if ($product['stock_quantity'] <= 0) {
                    $product['badge'] = 'Out of Stock';
                    $product['badgeColor'] = 'bg-red-500';
                } elseif ($product['discount'] > 0) {
                    $product['badge'] = 'On Sale';
                    $product['badgeColor'] = 'bg-green-500';
                } elseif (strtotime($product['created_at']) >= strtotime('-30 days')) {
                    $product['badge'] = 'New Arrival';
                    $product['badgeColor'] = 'bg-primary';
                } else {
                    $product['badge'] = null;
                    $product['badgeColor'] = null;
                }

                $product['created_at'] = date('c', strtotime($product['created_at']));
            }

            echo json_encode([
                'status' => 'success',
                'data' => $products,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $total_pages,
                    'total_products' => $total_products
                ]
            ]);
        } catch (PDOException $e) {
            logError('Failed to fetch products: ' . $e->getMessage(), $query, $params);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch products: ' . $e->getMessage()]);
        } catch (Exception $e) {
            logError('Unexpected error: ' . $e->getMessage(), $query, $params);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred']);
        }
    }
}

$conn = null;
?>