<?php
/**
 * CẤU HÌNH KẾT NỐI DATABASE MYSQL TRÊN INFINITYFREE
 * (Tùy chọn: Nếu bạn muốn lưu lời chúc vào MySQL của InfinityFree)
 * 
 * Lấy thông tin này tại cPanel của InfinityFree -> MySQL Databases
 */

define('USE_MYSQL', false); // Đổi thành true nếu bạn muốn dùng MySQL thay vì file JSON tự động

define('DB_HOST', 'sqlxxx.infinityfree.com'); // MySQL Hostname từ cPanel InfinityFree
define('DB_USER', 'epiz_xxxxxxx');           // MySQL Username từ cPanel InfinityFree
define('DB_PASS', 'mat_khau_cua_ban');       // Mật khẩu vPanel / MySQL
define('DB_NAME', 'epiz_xxxxxxx_trungthu');  // Tên Database bạn tạo trên InfinityFree

function getDbConnection() {
    if (!USE_MYSQL) return null;
    
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}
