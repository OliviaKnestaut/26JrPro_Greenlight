<?php

require_once __DIR__ . '/vendor/autoload.php';

use GraphQL\GraphQL;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Configuration
$db_host = 'localhost';
$db_name = 'ojk25_db';
$db_user = 'ojk25';
$db_pass = 'SSfxtBMLDDM6/CpE';
$table_name = 'jr-proj-greenlight';

// Database Connection
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['errors' => [['message' => 'Database connection failed: ' . $e->getMessage()]]]);
    exit;
}

// Define Item Type
$itemType = new ObjectType([
    'name' => 'Event',
    'fields' => [
        'id' => ['type' => Type::nonNull(Type::id())],
        'eventName' => ['type' => Type::string()],
        'eventDescription' => ['type' => Type::string()],
        'eventDate' => ['type' => Type::string()],
        'setupTime' => ['type' => Type::string()],
        'startTime' => ['type' => Type::string()],
        'endTime' => ['type' => Type::string()],
    ],
]);

// Query Type
$queryType = new ObjectType([
    'name' => 'Query',
    'fields' => [
        'events' => [
            'type' => Type::listOf($itemType),
                'resolve' => function () use ($pdo, $table_name) {
                // Select actual DB columns to match the Item type
                $sql = "SELECT id, eventName, eventDate, setupTime, startTime, endTime, eventDescription FROM `{$table_name}` ORDER BY id DESC";
                $stmt = $pdo->query($sql);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                return $rows;
            },
        ],
        'event' => [
            'type' => $itemType,
            'args' => [
                'id' => ['type' => Type::nonNull(Type::id())],
            ],
            'resolve' => function ($root, $args) use ($pdo, $table_name) {
                // Select actual DB columns to match the Item type
                $stmt = $pdo->prepare("SELECT id, eventName, eventDate, setupTime, startTime, endTime, eventDescription FROM `{$table_name}` WHERE id = ?");
                $stmt->execute([$args['id']]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row;
            },
        ],
    ],
]);

// Mutation Type
$mutationType = new ObjectType([
    'name' => 'Mutation',
    'fields' => [
        'createEvent' => [
            'type' => $itemType,
            'args' => [
                'eventName' => ['type' => Type::nonNull(Type::string())],
                'eventDescription' => ['type' => Type::string()],
                'eventDate' => ['type' => Type::string()],
                'setupTime' => ['type' => Type::string()],
                'startTime' => ['type' => Type::string()],
                'endTime' => ['type' => Type::string()],
            ],
            'resolve' => function ($root, $args) use ($pdo, $table_name) {
                $stmt = $pdo->prepare("INSERT INTO `{$table_name}` (eventName, eventDescription, eventDate, setupTime, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $args['eventName'],
                    $args['eventDescription'] ?? null,
                    $args['eventDate'] ?? null,
                    $args['setupTime'] ?? null,
                    $args['startTime'] ?? null,
                    $args['endTime'] ?? null,
                ]);
                $id = $pdo->lastInsertId();

                $stmt = $pdo->prepare("SELECT id, eventName, eventDate, setupTime, startTime, endTime, eventDescription FROM `{$table_name}` WHERE id = ?");
                $stmt->execute([$id]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                return $row;
            },
        ],
        'updateEvent' => [
            'type' => $itemType,
            'args' => [
                'id' => ['type' => Type::nonNull(Type::id())],
                'eventName' => ['type' => Type::string()],
                'eventDescription' => ['type' => Type::string()],
                'eventDate' => ['type' => Type::string()],
                'setupTime' => ['type' => Type::string()],
                'startTime' => ['type' => Type::string()],
                'endTime' => ['type' => Type::string()],
            ],
            'resolve' => function ($root, $args) use ($pdo, $table_name) {
                $updates = [];
                $params = [];

                if (isset($args['eventName'])) {
                    $updates[] = 'eventName = ?';
                    $params[] = $args['eventName'];
                }
                if (isset($args['eventDescription'])) {
                    $updates[] = 'eventDescription = ?';
                    $params[] = $args['eventDescription'];
                }
                if (isset($args['eventDate'])) {
                    $updates[] = 'eventDate = ?';
                    $params[] = $args['eventDate'];
                }
                if (isset($args['setupTime'])) {
                    $updates[] = 'setupTime = ?';
                    $params[] = $args['setupTime'];
                }
                if (isset($args['startTime'])) {
                    $updates[] = 'startTime = ?';
                    $params[] = $args['startTime'];
                }
                if (isset($args['endTime'])) {
                    $updates[] = 'endTime = ?';
                    $params[] = $args['endTime'];
                }
                if (empty($updates)) {
                    throw new Exception('No fields to update');
                }

                $params[] = $args['id'];
                $sql = "UPDATE `{$table_name}` SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                $stmt = $pdo->prepare("SELECT id, eventName, eventDate, setupTime, startTime, endTime, eventDescription FROM `{$table_name}` WHERE id = ?");
                $stmt->execute([$args['id']]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row;
            },
        ],
        'deleteEvent' => [
            'type' => Type::boolean(),
            'args' => [
                'id' => ['type' => Type::nonNull(Type::id())],
            ],
            'resolve' => function ($root, $args) use ($pdo, $table_name) {
                $stmt = $pdo->prepare("DELETE FROM `{$table_name}` WHERE id = ?");
                $stmt->execute([$args['id']]);
                return $stmt->rowCount() > 0;
            },
        ],
    ],
]);

// Schema
$schema = new Schema([
    'query' => $queryType,
    'mutation' => $mutationType,
]);

// Quick debug endpoints: ?debug=table (JSON) or ?debug=html (HTML table)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['debug'])) {
    $debug = $_GET['debug'];
    try {
        $stmt = $pdo->query("SELECT id, eventName, eventDate, setupTime, startTime, endTime, eventDescription FROM `{$table_name}` ORDER BY id DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['errors' => [['message' => 'Database query failed: ' . $e->getMessage()]]]);
        exit;
    }

    if ($debug === 'table') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($rows);
        exit;
    }

    // default to HTML table for any other debug value (eg ?debug=html)
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>DB Table: ' . htmlspecialchars($table_name) . '</title></head><body>';
    echo '<h1>Table: ' . htmlspecialchars($table_name) . '</h1>';
    echo '<table border="1" cellpadding="6" style="border-collapse:collapse"><thead><tr>';
    echo '<th>id</th><th>eventName</th><th>eventDate</th><th>setupTime</th><th>startTime</th><th>endTime</th><th>eventDescription</th>';
    echo '</tr></thead><tbody>';
    foreach ($rows as $r) {
        echo '<tr>';
        echo '<td>' . htmlspecialchars($r['id'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($r['eventName'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($r['eventDate'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($r['setupTime'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($r['startTime'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($r['endTime'] ?? '') . '</td>';
        echo '<td>' . htmlspecialchars($r['eventDescription'] ?? '') . '</td>';
        echo '</tr>';
    }
    echo '</tbody></table></body></html>';
    exit;
}

// If a browser visits the endpoint with a GET and no debug or query, show a small landing page
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['debug']) && !isset($_GET['query'])) {
    // prefer HTML for browsers
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>GraphQL PHP Endpoint</title></head><body>';
    echo '<h1>GraphQL PHP Endpoint</h1>';
    echo '<p>This endpoint accepts GraphQL POST requests. Quick links for testing:</p>';
    echo '<ul>';
    echo '<li><a href="?debug=html">Debug: view table (HTML)</a></li>';
    echo '<li><a href="?debug=table">Debug: view table (JSON)</a></li>';
    echo '</ul>';
    echo '<p>To run a GraphQL query use a POST request with a JSON body. Example curl:</p>';
    echo '<pre>curl -X POST "' . htmlspecialchars((isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'index.php')) . '" -H "Content-Type: application/json" -d \'' . json_encode(['query' => '{ items { id name description createdAt } }']) . '\'</pre>';
    echo '<p>Or add <code>?query={items{id,name}}</code> to the URL for quick browser testing.</p>';
    echo '</body></html>';
    exit;
}

// Process Request
try {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    $query = $input['query'] ?? '';
    $variableValues = $input['variables'] ?? null;

    $result = GraphQL::executeQuery($schema, $query, null, null, $variableValues);
    $output = $result->toArray();
} catch (Exception $e) {
    $output = [
        'errors' => [
            [
                'message' => $e->getMessage(),
            ],
        ],
    ];
}

echo json_encode($output);
