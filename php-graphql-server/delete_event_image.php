<?php
header('Content-Type: application/json');

function respond($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed, use POST'], 405);
}

$filename = isset($_POST['filename']) ? trim($_POST['filename']) : '';

if ($filename === '') {
    respond(['error' => 'Missing filename parameter'], 400);
}

// Sanitize: strip any path separators to prevent directory traversal
$basename = basename($filename);
if ($basename === '' || $basename !== $filename) {
    respond(['error' => 'Invalid filename'], 400);
}

// Only allow safe image extensions
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$ext = strtolower(pathinfo($basename, PATHINFO_EXTENSION));
if (!in_array($ext, $allowed, true)) {
    respond(['error' => 'Invalid file type'], 400);
}

$targetDir = '/home/ojk25@drexel.edu/public_html/jrProjGreenlight/uploads/event_img';
$filePath = $targetDir . '/' . $basename;

// Confirm the resolved path is still inside the target directory
if (strpos(realpath(dirname($filePath)) ?: '', realpath($targetDir) ?: $targetDir) !== 0) {
    respond(['error' => 'Invalid file path'], 400);
}

if (!file_exists($filePath)) {
    // Already gone — treat as success so the front-end isn't blocked
    respond(['success' => true, 'message' => 'File not found (already deleted)']);
}

if (!unlink($filePath)) {
    respond(['error' => 'Failed to delete file'], 500);
}

respond(['success' => true, 'message' => 'File deleted successfully']);
