<?php
class Database {
    private $host = 'localhost';
    private $dbname = 'model_shop';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=$this->host;dbname=$this->dbname",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            error_log("Connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Connection failed: ' . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }

    // Hàm kiểm tra kết nối (dùng để debug)
    public function testConnection() {
        try {
            $this->getConnection();
            return "Connection successful!";
        } catch (PDOException $e) {
            return "Connection failed: " . $e->getMessage();
        }
    }
}
?>