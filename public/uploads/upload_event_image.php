<?php
// Temporary debug logging: append basic request info to upload_debug.log
$debugFile = rtrim(__DIR__, '/\\') . '/upload_debug.log';
$filesInfo = [];
foreach ((array)($_FILES ?? []) as $k => $v) {
    $filesInfo[$k] = [
        'name' => $v['name'] ?? null,
        'type' => $v['type'] ?? null,
        'size' => $v['size'] ?? null,
        'error' => $v['error'] ?? null,
        'tmp_name' => $v['tmp_name'] ?? null,
    ];
}
$debug = [
    'time' => date('c'),
    'method' => $_SERVER['REQUEST_METHOD'] ?? null,
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? ($_SERVER['HTTP_CONTENT_TYPE'] ?? null),
    'content_length' => $_SERVER['CONTENT_LENGTH'] ?? null,
    'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null,
    'files' => $filesInfo,
    'post' => $_POST ?? [],
];
@file_put_contents($debugFile, json_encode($debug) . PHP_EOL, FILE_APPEND);
header('Content-Type: application/json');

$includeDebug = isset($_GET['debug']) && $_GET['debug'] === '1';
function respond($payload, $code = 200) {
    global $includeDebug, $debug, $mime, $filesInfo, $file;
    if ($includeDebug) {
        $payload['server_debug'] = $debug ?? [];
        $payload['server_debug']['resolved_mime'] = $mime ?? null;
        $payload['server_debug']['files'] = $filesInfo ?? [];
        $payload['server_debug']['file_tmp_exists'] = !empty($file['tmp_name']) && file_exists($file['tmp_name']);
    }
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed, use POST'], 405);
}

// Use a directory relative to this script so the path works on the server.
// This will place uploaded images in the `event_img` folder next to this PHP file.
$targetDir = rtrim(__DIR__, '/\\') . '/event_img';

if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0775, true)) {
        error_log("upload_event_image: failed to create directory {$targetDir}");
        respond(['error' => 'Failed to create target directory', 'targetDir' => $targetDir], 500);
    }
}

// Ensure target directory is writable by the webserver before accepting files
if (!is_writable($targetDir)) {
    error_log("upload_event_image: target directory not writable: {$targetDir}");
    respond(['error' => 'Target directory not writable', 'targetDir' => $targetDir, 'is_writable' => is_writable($targetDir)], 500);
}

if (!isset($_FILES['event_img'])) {
    respond(['error' => 'No file uploaded (field name must be "event_img")'], 453);
}

$file = $_FILES['event_img'];

$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    respond(['error' => 'File exceeds maximum size of 5MB'], 451);
}

$finfo = null;
$mime = null;
if (function_exists('finfo_open')) {
    $finfo = @finfo_open(FILEINFO_MIME_TYPE);
}
if ($finfo && !empty($file['tmp_name'])) {
    $mime = @finfo_file($finfo, $file['tmp_name']);
    @finfo_close($finfo);
}
// Fallbacks if finfo is not available or failed
if (empty($mime) && function_exists('mime_content_type') && !empty($file['tmp_name'])) {
    $mime = @mime_content_type($file['tmp_name']);
}
if (empty($mime) && !empty($file['type'])) {
    $mime = $file['type'];
}
if (empty($mime)) {
    $mime = 'application/octet-stream';
}

// Log resolved mime for debugging
@file_put_contents($debugFile, json_encode(['time' => date('c'), 'resolved_mime' => $mime]) . PHP_EOL, FILE_APPEND);

// Additional fallback: if mime still generic, try getimagesize() or exif_imagetype()
if ($mime === 'application/octet-stream' || empty($mime)) {
    $imgTmp = false;
    if (!empty($file['tmp_name']) && file_exists($file['tmp_name'])) {
        $imgTmp = @getimagesize($file['tmp_name']);
    }
    if ($imgTmp && !empty($imgTmp['mime'])) {
        $mime = $imgTmp['mime'];
    } else if (!empty($file['tmp_name']) && file_exists($file['tmp_name']) && function_exists('exif_imagetype')) {
        $typeConst = @exif_imagetype($file['tmp_name']);
        $map = [];
        if (defined('IMAGETYPE_GIF')) $map[IMAGETYPE_GIF] = 'image/gif';
        if (defined('IMAGETYPE_JPEG')) $map[IMAGETYPE_JPEG] = 'image/jpeg';
        if (defined('IMAGETYPE_PNG')) $map[IMAGETYPE_PNG] = 'image/png';
        if (defined('IMAGETYPE_WEBP')) $map[IMAGETYPE_WEBP] = 'image/webp';
        if ($typeConst !== false && isset($map[$typeConst])) {
            $mime = $map[$typeConst];
        }
    }
    @file_put_contents($debugFile, json_encode(['time'=>date('c'),'fallback_mime'=>$mime]) . PHP_EOL, FILE_APPEND);
}

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp'
];

if (!array_key_exists($mime, $allowed)) {
    respond(['error' => 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed', 'detected_mime' => $mime], 452);
}

$imgInfo = @getimagesize($file['tmp_name']);
$width = $imgInfo[0] ?? null;
$height = $imgInfo[1] ?? null;
$recommendedW = 1300;
$recommendedH = 780;
$dimensionWarning = null;
if ($width && $height && ($width != $recommendedW || $height != $recommendedH)) {
    $dimensionWarning = "Recommended dimensions are {$recommendedW}x{$recommendedH}. Uploaded is {$width}x{$height}.";
}


// Allow client to request a desired filename (without extension). We'll sanitize it.
$desiredNameRaw = $_POST['desired_name'] ?? null;
$ext = $allowed[$mime];
if ($desiredNameRaw) {
    // sanitize: keep letters, numbers, dash, underscore
    $desired = preg_replace('/[^A-Za-z0-9_-]/', '_', $desiredNameRaw);
    $desired = substr($desired, 0, 200); // limit length
    $targetName = $desired . '.' . $ext;
    $destination = rtrim($targetDir, '/') . '/' . $targetName;
    // If file exists, append timestamp to avoid overwrite
    if (file_exists($destination)) {
        $targetName = $desired . '-' . time() . '.' . $ext;
        $destination = rtrim($targetDir, '/') . '/' . $targetName;
    }
} else {
    $basename = bin2hex(random_bytes(8));
    $targetName = $basename . '.' . $ext;
    $destination = rtrim($targetDir, '/') . '/' . $targetName;
}

if (!e_uploaded_filmove($file['tmp_name'], $destination)) {
    error_log("upload_event_image: move_uploaded_file failed from {$file['tmp_name']} to {$destination}");
    respond(['error' => 'Failed to move uploaded file to destination', 'tmp' => $file['tmp_name'], 'dest' => $destination], 500);
}


// Build a public URL based on the known public path. Adjust if your hosting differs.
$publicUrl = '/~ojk25/jrProjGreenlight/uploads/event_img/' . $targetName;

$response = [
    'success' => true,
    'path' => $destination,
    'url' => $publicUrl,
    'filename' => $targetName,
    'dimensionWarning' => $dimensionWarning
];

// If requested, include server-side debug info in the response for testing
if (isset($_GET['debug']) && $_GET['debug'] === '1') {
    $response['server_debug'] = $debug;
    $response['server_debug']['resolved_mime'] = $mime ?? null;
}

respond($response, 200);
