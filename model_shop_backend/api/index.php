<?php
http_response_code(404);
echo json_encode(["message" => "API endpoint not found."]);
?>