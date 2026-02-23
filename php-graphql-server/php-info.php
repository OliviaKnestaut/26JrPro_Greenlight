<?php
// Shows PHP upload-related settings
header('Content-Type: text/plain');
echo 'php_version=' . phpversion() . PHP_EOL;
echo 'php_sapi=' . php_sapi_name() . PHP_EOL;
echo 'upload_max_filesize=' . ini_get('upload_max_filesize') . PHP_EOL;
echo 'post_max_size=' . ini_get('post_max_size') . PHP_EOL;
echo 'upload_tmp_dir=' . ini_get('upload_tmp_dir') . PHP_EOL;
echo 'file_uploads=' . ini_get('file_uploads') . PHP_EOL;
echo 'max_execution_time=' . ini_get('max_execution_time') . PHP_EOL;
echo 'memory_limit=' . ini_get('memory_limit') . PHP_EOL;
echo 'display_errors=' . ini_get('display_errors') . PHP_EOL;
echo 'error_log=' . ini_get('error_log') . PHP_EOL;

echo '\n-- SERVER --\n';
foreach (['REMOTE_ADDR','SERVER_SOFTWARE','SERVER_PROTOCOL','REQUEST_METHOD'] as $k) {
    if (isset($_SERVER[$k])) echo "$k=" . $_SERVER[$k] . PHP_EOL;
}
?>
