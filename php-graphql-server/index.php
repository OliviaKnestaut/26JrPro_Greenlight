<?php

require_once __DIR__ . '/vendor/autoload.php';

use GraphQL\GraphQL;
use GraphQL\Utils\BuildSchema;
use GraphQL\Error\FormattedError;
use GraphQL\Error\DebugFlag;

// Database Connection
$db_host = 'localhost';
$db_name = 'ojk25_db';
$db_user = 'ojk25';
$db_pass = 'SSfxtBMLDDM6/CpE';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['errors' => [['message' => 'Database connection failed: ' . $e->getMessage()]]]);
    exit;
}

$sdl = file_get_contents(__DIR__ . '/schema.graphql');

if ($sdl === false || $sdl === null) {
    header('Content-Type: application/json', true, 500);
    echo json_encode(['errors' => [['message' => 'Failed to load schema.graphql']]]);
    exit;
}

$schema = BuildSchema::build($sdl);

// Column maps (GraphQL field -> DB column) if needed
$COL_MAP = [
    'Event' => [
        'organizationId' => 'organization_id',
        'title' => 'title',
        'description' => 'description',
        'eventDate' => 'event_date',
        'setupTime' => 'setup_time',
        'startTime' => 'start_time',
        'endTime' => 'end_time',
        'location' => 'location',
        'eventStatus' => 'event_status',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ],
    'Organization' => [
        'orgName' => 'orgName',
        'username' => 'username',
        'password_hash' => 'password_hash',
        'bio' => 'bio',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ],
];

// Helper: map DB row (snake_case columns) to GraphQL field keys using $COL_MAP
function mapDbRowToGraphQL(array $row, string $type, array $COL_MAP) : array {
    $out = [];
    if (!isset($COL_MAP[$type])) {
        return $row;
    }
    foreach ($COL_MAP[$type] as $gk => $dbCol) {
        if (array_key_exists($dbCol, $row)) {
            $out[$gk] = $row[$dbCol];
        } elseif (array_key_exists($gk, $row)) {
            $out[$gk] = $row[$gk];
        } else {
            $out[$gk] = null;
        }
    }
    // include any extra columns unchanged
    foreach ($row as $k => $v) {
        if (!in_array($k, $COL_MAP[$type], true)) {
            $out[$k] = $v;
        }
    }
    return $out;
}

// helper: fetch organization by id
$fetchOrganization = function($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
};

// CORS helper - allow requests from browser clients (adjust origin in production)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Handle preflight OPTIONS requests early
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return 200 for preflight
    http_response_code(200);
    exit;
}

// root resolvers for top-level fields
$rootValue = [
    'events' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $where = [];
        $params = [];
        if (isset($args['status'])) { $where[] = "event_status = :status"; $params[':status'] = $args['status']; }
        if (isset($args['fromDate'])) { $where[] = "event_date >= :fromDate"; $params[':fromDate'] = $args['fromDate']; }
        if (isset($args['toDate'])) { $where[] = "event_date <= :toDate"; $params[':toDate'] = $args['toDate']; }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT * FROM `greenlight-events` $whereSql ORDER BY id DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // map DB rows to GraphQL field names and attach organization
        $out = [];
        foreach ($rows as $r) {
            $mapped = mapDbRowToGraphQL($r, 'Event', $COL_MAP);
            $orgId = $r['organization_id'] ?? $r['organizationId'] ?? null;
            if ($orgId) $mapped['organization'] = $fetchOrganization($pdo, $orgId);
            $out[] = $mapped;
        }
        return $out;
    },

    'event' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-events` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $args['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $mapped = mapDbRowToGraphQL($row, 'Event', $COL_MAP);
            $orgId = $row['organization_id'] ?? $row['organizationId'] ?? null;
            if ($orgId) $mapped['organization'] = $fetchOrganization($pdo, $orgId);
            return $mapped;
        }
        return null;
    },

    'organizations' => function($root, $args) use ($pdo, $COL_MAP) {
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $where = [];
        $params = [];
        if (isset($args['username'])) { $where[] = "username = :username"; $params[':username'] = $args['username']; }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT * FROM `greenlight-orgs` $whereSql ORDER BY id DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $out = [];
        foreach ($rows as $r) { $out[] = mapDbRowToGraphQL($r, 'Organization', $COL_MAP); }
        return $out;
    },

    'organization' => function($root, $args) use ($pdo, $COL_MAP) {
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $args['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? mapDbRowToGraphQL($row, 'Organization', $COL_MAP) : null;
    },

    // Mutations
    'createEvent' => function($root, $args) use ($pdo, $COL_MAP) {
        $in = $args['input'];
        $cols = [];
        $placeholders = [];
        $params = [];
        foreach ($in as $k => $v) {
            if (!isset($COL_MAP['Event'][$k])) continue;
            $dbCol = $COL_MAP['Event'][$k];
            $cols[] = $dbCol;
            $placeholders[] = ":$k";
            $params[":$k"] = $v;
        }
        if (empty($cols)) throw new \Exception('No input provided');
        $sqlCols = implode('`,`', $cols);
        $placeholdersStr = implode(',', $placeholders);
        $stmt = $pdo->prepare("INSERT INTO `greenlight-events` (`$sqlCols`) VALUES ($placeholdersStr)");
        $stmt->execute($params);
        $id = $pdo->lastInsertId();
        $s = $pdo->prepare("SELECT * FROM `greenlight-events` WHERE id = :id LIMIT 1");
        $s->execute([':id' => $id]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        return $row ? mapDbRowToGraphQL($row, 'Event', $COL_MAP) : null;
    },

    'updateEvent' => function($root, $args) use ($pdo, $COL_MAP) {
        $id = $args['id'];
        $in = $args['input'];
        $set = [];
        $params = [':id' => $id];
        foreach ($in as $k => $v) {
            if (!isset($COL_MAP['Event'][$k])) continue;
            $dbCol = $COL_MAP['Event'][$k];
            $set[] = "`$dbCol` = :$k";
            $params[":$k"] = $v;
        }
        if (empty($set)) throw new \Exception('No fields to update');
        $sql = "UPDATE `greenlight-events` SET " . implode(',', $set) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $s = $pdo->prepare("SELECT * FROM `greenlight-events` WHERE id = :id LIMIT 1");
        $s->execute([':id' => $id]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        return $row ? mapDbRowToGraphQL($row, 'Event', $COL_MAP) : null;
    },

    'deleteEvent' => function($root, $args) use ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM `greenlight-events` WHERE id = :id");
        return $stmt->execute([':id' => $args['id']]);
    },

    'eventsByOrganization' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        $orgId = $args['orgId'];
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $where = ["organization_id = :orgId"];
        $params = [':orgId' => $orgId];
        if (isset($args['status'])) { $where[] = "event_status = :status"; $params[':status'] = $args['status']; }
        if (isset($args['fromDate'])) { $where[] = "event_date >= :fromDate"; $params[':fromDate'] = $args['fromDate']; }
        if (isset($args['toDate'])) { $where[] = "event_date <= :toDate"; $params[':toDate'] = $args['toDate']; }
        $whereSql = 'WHERE ' . implode(' AND ', $where);
        $sql = "SELECT * FROM `greenlight-events` $whereSql ORDER BY id DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $out = [];
        foreach ($rows as $r) {
            $mapped = mapDbRowToGraphQL($r, 'Event', $COL_MAP);
            $mapped['organization'] = $fetchOrganization($pdo, $orgId);
            $out[] = $mapped;
        }
        return $out;
    },

    'createOrganization' => function($root, $args) use ($pdo) {
        $in = $args['input'];
        // allowed org inputs per schema
        $allowedOrg = ['orgName','username','password_hash','bio'];
        $cols = [];
        $params = [];
        foreach ($allowedOrg as $c) {
            if (isset($in[$c])) {
                $cols[] = $c;
                $params[":$c"] = $in[$c];
            }
        }
        $sqlCols = implode('`,`', $cols);
        $placeholders = implode(',', array_map(fn($c) => ":$c", $cols));
        $stmt = $pdo->prepare("INSERT INTO `greenlight-orgs` (`$sqlCols`) VALUES ($placeholders)");
        $stmt->execute($params);
        $id = $pdo->lastInsertId();
        $s = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE id = :id LIMIT 1");
        $s->execute([':id'=>$id]);
        return $s->fetch(PDO::FETCH_ASSOC) ?: null;
    },

    'updateOrganization' => function($root, $args) use ($pdo, $COL_MAP) {
        $id = $args['id'];
        $in = $args['input'];
        $set = [];
        $params = [':id' => $id];
        foreach ($in as $k=>$v) { $col = $COL_MAP['Organization'][$k] ?? $k; $set[] = "`$col` = :$k"; $params[":$k"]=$v; }
        if (empty($set)) throw new \Exception('No fields to update');
        $stmt = $pdo->prepare("UPDATE `greenlight-orgs` SET " . implode(',', $set) . " WHERE id = :id");
        $stmt->execute($params);
        $s = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE id = :id LIMIT 1");
        $s->execute([':id'=>$id]);
        return $s->fetch(PDO::FETCH_ASSOC) ?: null;
    },

    'deleteOrganization' => function($root, $args) use ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM `greenlight-orgs` WHERE id = :id");
        return $stmt->execute([':id' => $args['id']]);
    },
];

// Read incoming request (GraphQL JSON)
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];
$query = $payload['query'] ?? ($_GET['query'] ?? null);
$rawTrim = is_string($raw) ? trim($raw) : '';
// Fallbacks: accept form-encoded POST (`$_POST['query']`) or raw GraphQL body (Content-Type: application/graphql)
if ($query === null) {
    $query = $_POST['query'] ?? null;
}
if ($query === null && $rawTrim !== '') {
    // If body wasn't JSON-decoded but contains text, treat it as the query string.
    $query = $rawTrim;
}
$variables = $payload['variables'] ?? ($_GET['variables'] ?? null);

if ($query === null) {
    header('Content-Type: application/json', true, 400);
    echo json_encode(['errors' => [['message' => 'No GraphQL query provided']]]);
    exit;
}

try {
    $result = GraphQL::executeQuery($schema, $query, $rootValue, null, $variables, null, null);
    $output = $result->toArray();
    header('Content-Type: application/json');
    echo json_encode($output);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['errors' => [['message' => $e->getMessage()]]]);
}