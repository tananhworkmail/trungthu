<?php
// Copy to db_credentials.php and fill in the hosting credentials.
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}
return [
    'host' => 'your-mysql-host',
    'user' => 'your-mysql-user',
    'pass' => 'your-mysql-password',
    'db' => 'your-mysql-database',
];
