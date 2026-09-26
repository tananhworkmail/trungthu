<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Wishes are private; view saved rows through the hosting account's phpMyAdmin.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, ['success' => false, 'message' => 'Chỉ hỗ trợ thả đèn bằng POST.']);
}

require_once __DIR__ . '/bootstrap.php';
$token = $_SERVER['HTTP_X_WISH_TOKEN'] ?? '';
$validToken = is_string($token) && hash_equals($_SESSION['wish_token'], $token);
session_write_close();
if (!$validToken) {
    reply(403, ['success' => false, 'message' => 'Phiên trang đã hết hạn. Em tải lại trang rồi thả đèn nhé.']);
}

$raw = file_get_contents('php://input', false, null, 0, 4097);
if ($raw === false || strlen($raw) > 4096) {
    reply(413, ['success' => false, 'message' => 'Điều ước quá dài.']);
}
try {
    $input = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
} catch (JsonException $error) {
    reply(400, ['success' => false, 'message' => 'Điều ước chưa đúng định dạng.']);
}
if (!is_array($input) || !is_string($input['wish'] ?? null) || !is_string($input['author'] ?? null)) {
    reply(400, ['success' => false, 'message' => 'Thiếu nội dung điều ước hoặc tên người thả đèn.']);
}
$wish = preg_replace('/^\s+|\s+$/u', '', $input['wish']);
$author = preg_replace('/^\s+|\s+$/u', '', $input['author']);
if ($wish === '' || $author === '' || preg_match_all('/./us', $wish) > 60 || preg_match_all('/./us', $author) > 100) {
    reply(422, ['success' => false, 'message' => 'Điều ước cần từ 1 đến 60 ký tự, tên tối đa 100 ký tự.']);
}

try {
    require_once __DIR__ . '/db_config.php';
    $conn = getDbConnection();
    $conn->query('CREATE TABLE IF NOT EXISTS wishes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author VARCHAR(100) NOT NULL,
        wish TEXT NOT NULL,
        created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    $createdAt = date('Y-m-d H:i:s');
    $stmt = $conn->prepare('INSERT INTO wishes (author, wish, created_at) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $author, $wish, $createdAt);
    $stmt->execute();
    if ($stmt->affected_rows !== 1) {
        throw new RuntimeException('Wish was not saved.');
    }
    $id = $conn->insert_id;
    $stmt->close();
    $conn->close();
    reply(201, [
        'success' => true,
        'storage' => 'mysql',
        'message' => 'Đèn trời đã mang điều ước của em bay lên ngân hà.',
        'data' => ['id' => $id, 'created_at' => $createdAt],
    ]);
} catch (Throwable $error) {
    error_log('Wish database operation failed; code=' . $error->getCode());
    reply(503, ['success' => false, 'message' => 'Chưa lưu được điều ước. Em giữ lại nội dung và thử thả đèn lần nữa nhé.']);
}
