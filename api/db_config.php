<?php
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

function getDbConnection(): mysqli
{
    if (!extension_loaded('mysqli')) {
        throw new RuntimeException('MySQLi is required.');
    }
    $config = require __DIR__ . '/db_credentials.php';
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conn = mysqli_init();
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
    $conn->real_connect($config['host'], $config['user'], $config['pass'], $config['db'], $config['port'] ?? 3306);
    $conn->set_charset('utf8mb4');
    return $conn;
}
