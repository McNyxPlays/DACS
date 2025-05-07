<?php
function sanitize_input($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function log_error($message, $query = null, $params = null) {
    $log_file = '../logs/error_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message";
    if ($query) {
        $log_message .= "\nQuery: $query";
        if ($params) {
            $log_message .= "\nParams: " . json_encode($params);
        }
    }
    $log_message .= "\n";
    file_put_contents($log_file, $log_message, FILE_APPEND);
}
?>