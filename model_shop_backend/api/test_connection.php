<?php
require '../config/database.php';
$db = new Database();
echo $db->testConnection();
?>