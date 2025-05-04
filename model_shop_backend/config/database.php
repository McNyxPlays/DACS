<?php

class Database {
    private $host = 'localhost';
    private $dbname = 'model_shop';
    private $username = 'root';
    private $password = '';

    public function getConnection() {
        try {
            $conn = new PDO(
                "mysql:host=$this->host;dbname=$this->dbname;charset=utf8",
                $this->username,
                $this->password
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $e) {
            error_log("Connection failed: " . $e->getMessage());
            return null;
        }
    }

    public function testConnection() {
        try {
            $this->getConnection();
            return "Connection successful!";
        } catch (PDOException $e) {
            return "Connection failed: " . $e->getMessage();
        }
    }
}

function db_connect() {
    $db = new Database();
    return $db->getConnection();
}

?>