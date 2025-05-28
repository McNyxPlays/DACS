<?php

class Database {
    private $host = 'localhost';
    private $dbname = 'model_shop';
    private $username = 'root';
    private $password = '';
    private $conn = null; // Thêm thuộc tính để tái sử dụng kết nối

    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=$this->host;dbname=$this->dbname;charset=utf8",
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); // Tắt emulate prepares
                error_log("Database connection established successfully");
            } catch (PDOException $e) {
                error_log("Connection failed: " . $e->getMessage());
                throw new PDOException("Database connection failed: " . $e->getMessage()); // Ném lỗi để xử lý ở cấp cao hơn
            }
        }
        return $this->conn;
    }

    public function testConnection() {
        try {
            $this->getConnection();
            return "Connection successful!";
        } catch (PDOException $e) {
            return "Connection failed: " . $e->getMessage();
        }
    }

    // Đóng kết nối (tùy chọn, gọi khi không cần nữa)
    public function closeConnection() {
        $this->conn = null;
    }
}

function db_connect() {
    $db = new Database();
    return $db->getConnection();
}
?>