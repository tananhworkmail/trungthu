<?php
/**
 * API LƯU VÀ ĐỌC ĐIỀU ƯỚC THIÊN ĐĂNG
 * Hỗ trợ tự động lưu vào file JSON hoặc MySQL Database trên InfinityFree
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once __DIR__ . '/db_config.php';

$jsonFile = __DIR__ . '/wishes.json';

// Xử lý gửi điều ước mới (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $wishText = trim($input['wish'] ?? $_POST['wish'] ?? '');
    $author = trim($input['author'] ?? $_POST['author'] ?? 'Em');

    if (empty($wishText)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nội dung điều ước không được để trống']);
        exit;
    }

    // Làm sạch ký tự HTML để bảo mật (XSS prevention)
    $wishText = htmlspecialchars($wishText, ENT_QUOTES, 'UTF-8');
    $author = htmlspecialchars($author, ENT_QUOTES, 'UTF-8');
    $createdAt = date('Y-m-d H:i:s');

    $saved = false;

    // Cách 1: Lưu vào MySQL nếu kích hoạt
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            // Tự động tạo bảng nếu chưa có
            $pdo->exec("CREATE TABLE IF NOT EXISTS wishes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                author VARCHAR(100) NOT NULL,
                wish TEXT NOT NULL,
                created_at DATETIME NOT NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            $stmt = $pdo->prepare("INSERT INTO wishes (author, wish, created_at) VALUES (?, ?, ?)");
            $saved = $stmt->execute([$author, $wishText, $createdAt]);
        } catch (Exception $e) {
            error_log("MySQL save error: " . $e->getMessage());
        }
    }

    // Cách 2: Tự động lưu vào file wishes.json (luôn hoạt động ổn định trên InfinityFree mà không cần cài MySQL)
    if (!$saved) {
        $wishes = [];
        if (file_exists($jsonFile)) {
            $data = file_get_contents($jsonFile);
            $wishes = json_decode($data, true) ?: [];
        }

        array_unshift($wishes, [
            'author' => $author,
            'wish' => $wishText,
            'created_at' => $createdAt
        ]);

        // Giữ tối đa 100 điều ước gần nhất
        $wishes = array_slice($wishes, 0, 100);
        file_put_contents($jsonFile, json_encode($wishes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $saved = true;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Điều ước đã được gửi lên trăng rằm thành công!',
        'data' => [
            'author' => $author,
            'wish' => $wishText,
            'created_at' => $createdAt
        ]
    ]);
    exit;
}

// Xử lý lấy danh sách điều ước (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $wishes = [];
    $pdo = getDbConnection();
    
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT author, wish, created_at FROM wishes ORDER BY id DESC LIMIT 50");
            $wishes = $stmt->fetchAll();
        } catch (Exception $e) {
            error_log("MySQL fetch error: " . $e->getMessage());
        }
    }

    if (empty($wishes) && file_exists($jsonFile)) {
        $data = file_get_contents($jsonFile);
        $wishes = json_decode($data, true) ?: [];
    }

    echo json_encode([
        'success' => true,
        'data' => $wishes
    ]);
    exit;
}
