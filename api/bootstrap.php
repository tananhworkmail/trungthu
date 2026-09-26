<?php
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

ini_set('display_errors', '0');
date_default_timezone_set('Asia/Ho_Chi_Minh');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'use_strict_mode' => true,
        'cookie_httponly' => true,
        'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'cookie_samesite' => 'Lax',
    ]);
}
if (empty($_SESSION['wish_token'])) {
    $_SESSION['wish_token'] = bin2hex(random_bytes(32));
}
