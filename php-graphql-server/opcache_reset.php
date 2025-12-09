<?php
header('Content-Type: application/json');

// Optional secret guard. Set environment variable OPCACHE_RESET_SECRET on the server
$expected = getenv('OPCACHE_RESET_SECRET') ?: '';
$secret = $_GET['secret'] ?? $_POST['secret'] ?? '';

if ($expected !== '') {
    if ($secret !== $expected) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden: invalid secret']);
        exit;
    }
}

if (!function_exists('opcache_reset')) {
    http_response_code(501);
    echo json_encode(['success' => false, 'message' => 'opcache_reset not available']);
    exit;
}

$ok = @opcache_reset();
echo json_encode(['success' => (bool)$ok]);
