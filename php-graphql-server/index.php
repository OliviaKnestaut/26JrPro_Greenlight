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
    // Common on some systems: 'localhost' tries a unix socket that may not exist.
    // Try a TCP fallback to 127.0.0.1:3306 which avoids socket lookup.
    $errMsg = $e->getMessage();
    if (stripos($errMsg, 'No such file or directory') !== false || stripos($errMsg, 'Connection refused') !== false) {
        try {
            $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e2) {
            // try common unix socket locations before giving up
            $sockets = ['/tmp/mysql.sock', '/var/run/mysqld/mysqld.sock', '/var/run/mysql/mysql.sock'];
            $connected = false;
            foreach ($sockets as $sock) {
                try {
                    $pdo = new PDO("mysql:unix_socket=$sock;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    $connected = true;
                    break;
                } catch (PDOException $e3) {
                    // continue to next socket
                }
            }
            if (!$connected) {
                @mkdir(__DIR__ . '/tmp', 0755, true);
                @file_put_contents(__DIR__ . '/tmp/db-connection.log', date('c') . " DB connect failed: " . $e2->getMessage() . "; attempted sockets: " . implode(',', $sockets) . "\n", FILE_APPEND);
                echo json_encode(['errors' => [['message' => 'Database connection failed: ' . $e2->getMessage()]]]);
                exit;
            }
        }
    } else {
        echo json_encode(['errors' => [['message' => 'Database connection failed: ' . $errMsg]]]);
        exit;
    }
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
        'organizationUsername' => 'organization',
        'createdBy' => 'created_by',
        'title' => 'title',
        'description' => 'description',
        'eventDate' => 'event_date',
        'setupTime' => 'setup_time',
        'startTime' => 'start_time',
        'endTime' => 'end_time',
        'location' => 'location',
        'locationId' => 'location_id',
        'locationType' => 'location_type',
        'eventLevel' => 'event_level',
        'eventImg' => 'event_img',
        'eventStatus' => 'event_status',
        'formData' => 'form_data',
        'submittedAt' => 'submitted_at',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ],
    'Location' => [
        'buildingCode' => 'buildingCode',
        'buildingDisplayName' => 'buildingDisplayName',
        'roomTitle' => 'roomTitle',
        'roomType' => 'roomType',
        'maxCapacity' => 'maxCapacity',
    ],
    'Organization' => [
        'orgName' => 'org_name',
        'username' => 'username',
        'bio' => 'bio',
        'orgImg' => 'org_img',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ],
    'User' => [
        'firstName' => 'first_name',
        'lastName' => 'last_name',
        'username' => 'username',
        'password' => 'password',
        'profileImg' => 'profile_img',
        'role' => 'role',
        'organizationUsername' => 'organization',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ],
    'Purchase' => [
        'organizationUsername' => 'organization',
        'dateSubmitted' => 'date_submitted',
        'itemTitle' => 'item_title',
        'itemCategory' => 'item_category',
        'eventId' => 'event_id',
        'orderStatus' => 'order_status',
        'itemCost' => 'item_cost',
    ],
];

function locationDbToEnum($dbVal) {
    if ($dbVal === null) return null;
    $v = strtoupper(str_replace([' ', '-'], '_', (string)$dbVal));
    $allowed = ['ON_CAMPUS', 'OFF_CAMPUS', 'VIRTUAL'];
    return in_array($v, $allowed, true) ? $v : null;
}

function locationEnumToDb($enumVal) {
    if ($enumVal === null) return null;
    $allowed = ['ON_CAMPUS', 'OFF_CAMPUS', 'VIRTUAL'];
    if (in_array($enumVal, $allowed, true)) return $enumVal;
    $v = strtoupper(str_replace([' ', '-'], '_', (string)$enumVal));
    return in_array($v, $allowed, true) ? $v : null;
}

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
    // post-process certain fields for specific types
    if ($type === 'Event') {
        try {
            if (array_key_exists('locationType', $out) && $out['locationType'] !== null) {
                $out['locationType'] = locationDbToEnum($out['locationType']);
            }
            if (array_key_exists('eventStatus', $out) && $out['eventStatus'] !== null) {
                // normalize status to uppercase enum-like string
                $out['eventStatus'] = strtoupper($out['eventStatus']);
            }
            // Normalize formData: store as decoded JSON if possible, null if empty string
            if (array_key_exists('formData', $out)) {
                $fd = $out['formData'];
                if ($fd === null) {
                    // leave as null
                } elseif (is_string($fd)) {
                    $trim = trim($fd);
                    if ($trim === '') {
                        $out['formData'] = null;
                    } else {
                        // Attempt to decode JSON payloads; if fails, keep original string
                        if (($trim[0] === '{' || $trim[0] === '[')) {
                            $decoded = json_decode($trim, true);
                            if (json_last_error() === JSON_ERROR_NONE) {
                                $out['formData'] = $decoded;
                            } else {
                                // leave as string but log malformed JSON
                                @mkdir(__DIR__ . '/tmp', 0755, true);
                                @file_put_contents(__DIR__ . '/tmp/graphql-events-error.log', date('c') . " malformed formData for event id=" . ($out['id'] ?? 'unknown') . " json_error=" . json_last_error_msg() . "\n", FILE_APPEND);
                            }
                        }
                    }
                }
            }
        } catch (Throwable $e) {
            @mkdir(__DIR__ . '/tmp', 0755, true);
            @file_put_contents(__DIR__ . '/tmp/graphql-events-error.log', date('c') . " mapDbRowToGraphQL Event post-process error for id=" . ($out['id'] ?? 'unknown') . ": " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
        }
    }
    return $out;
}

// helper: fetch organization by id or username
$fetchOrganization = function($pdo, $idOrUsername) use ($COL_MAP) {
    if (is_numeric($idOrUsername)) {
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $idOrUsername]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE username = :username LIMIT 1");
        $stmt->execute([':username' => $idOrUsername]);
    }
    $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    if (!$row) return null;
    return mapDbRowToGraphQL($row, 'Organization', $COL_MAP);
};

// helper: fetch location by id
$fetchLocation = function($pdo, $id) use ($COL_MAP) {
    $stmt = $pdo->prepare("SELECT * FROM `greenlight-locations` WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    if (!$row) return null;
    // Use mapDbRowToGraphQL so fields can be normalized if COL_MAP has entries
    return mapDbRowToGraphQL($row, 'Location', $COL_MAP);
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
        try {
            $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
            $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
            $where = [];
            $params = [];
            if (isset($args['status'])) { $where[] = "event_status = :status"; $params[':status'] = $args['status']; }
            if (isset($args['fromDate'])) { $where[] = "event_date >= :fromDate"; $params[':fromDate'] = $args['fromDate']; }
            if (isset($args['toDate'])) { $where[] = "event_date <= :toDate"; $params[':toDate'] = $args['toDate']; }
            $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            $sql = "SELECT * FROM `greenlight-events` $whereSql ORDER BY id ASC LIMIT :limit OFFSET :offset";
            $stmt = $pdo->prepare($sql);
            foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            // time the DB query to help diagnose slow queries in production
            $qStart = microtime(true);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $qMs = round((microtime(true) - $qStart) * 1000, 2);
            @file_put_contents(__DIR__ . '/tmp/graphql-timings.log', date('c') . " EVENTS_QUERY ms=" . $qMs . " rows=" . count($rows) . " sql=" . substr($sql,0,300) . "\n", FILE_APPEND);
            $out = [];
            foreach ($rows as $r) {
                $mapped = mapDbRowToGraphQL($r, 'Event', $COL_MAP);
                // ensure locationId is present on the GraphQL Event response
                if (array_key_exists('location_id', $r)) {
                    $mapped['locationId'] = $r['location_id'] === null ? null : (int)$r['location_id'];
                }
                $orgUsername = $r['organization'] ?? $r['organizationUsername'] ?? null;
                if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
                $out[] = $mapped;
            }
            return $out;
        } catch (Throwable $e) {
            @mkdir(__DIR__ . '/tmp', 0755, true);
            @file_put_contents(__DIR__ . '/tmp/graphql-events-error.log', date('c') . " events resolver error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
            throw $e;
        }
    },

    'event' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `greenlight-events` WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $args['id']]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $mapped = mapDbRowToGraphQL($row, 'Event', $COL_MAP);
                if (array_key_exists('location_id', $row)) {
                    $mapped['locationId'] = $row['location_id'] === null ? null : (int)$row['location_id'];
                }
                $orgUsername = $row['organization'] ?? $row['organizationUsername'] ?? null;
                if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
                return $mapped;
            }
            return null;
        } catch (Throwable $e) {
            @mkdir(__DIR__ . '/tmp', 0755, true);
            @file_put_contents(__DIR__ . '/tmp/graphql-events-error.log', date('c') . " event resolver error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
            throw $e;
        }
    },

    'organizations' => function($root, $args) use ($pdo, $COL_MAP) {
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $where = [];
        $params = [];
        if (isset($args['username'])) { $where[] = "username = :username"; $params[':username'] = $args['username']; }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT * FROM `greenlight-orgs` $whereSql ORDER BY id ASC LIMIT :limit OFFSET :offset";
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

    // Locations
    'location' => function($root, $args) use ($pdo, $fetchLocation) {
        $id = $args['id'];
        return $fetchLocation($pdo, $id);
    },

    'locations' => function($root, $args) use ($pdo, $COL_MAP) {
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $sql = "SELECT * FROM `greenlight-locations` ORDER BY id ASC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $out = [];
        foreach ($rows as $r) { $out[] = mapDbRowToGraphQL($r, 'Location', $COL_MAP); }
        return $out;
    },

    // Users
    'users' => function($root, $args) use ($pdo, $COL_MAP, $fetchOrganization) {
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $where = [];
        $params = [];
        if (isset($args['username'])) { $where[] = "username = :username"; $params[':username'] = $args['username']; }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT * FROM `greenlight-users` $whereSql ORDER BY id ASC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $out = [];
        foreach ($rows as $r) {
            $mapped = mapDbRowToGraphQL($r, 'User', $COL_MAP);
            $orgUsername = $r['organization'] ?? $r['organizationUsername'] ?? null;
            if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            $out[] = $mapped;
        }
        return $out;
    },

    'user' => function($root, $args) use ($pdo, $COL_MAP, $fetchOrganization) {
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-users` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $args['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $mapped = mapDbRowToGraphQL($row, 'User', $COL_MAP);
            $orgUsername = $row['organization'] ?? $row['organizationUsername'] ?? null;
            if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            return $mapped;
        }
        return null;
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
            // translate GraphQL enum input for locationType into DB value
            if ($k === 'locationType') {
                $params[":$k"] = locationEnumToDb($v);
            } else {
                $params[":$k"] = $v;
            }
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
            // translate locationType enum to DB value for storage
            if ($k === 'locationType') {
                $params[":$k"] = locationEnumToDb($v);
            } else {
                $params[":$k"] = $v;
            }
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

    'changeEventStatus' => function($root, $args) use ($pdo, $COL_MAP) {
        $id = $args['id'];
        $status = $args['status'];
        if (!$id) throw new \Exception('Missing id');
        if (!isset($status)) throw new \Exception('Missing status');
        $stmt = $pdo->prepare("UPDATE `greenlight-events` SET `event_status` = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        $s = $pdo->prepare("SELECT * FROM `greenlight-events` WHERE id = :id LIMIT 1");
        $s->execute([':id' => $id]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        return $row ? mapDbRowToGraphQL($row, 'Event', $COL_MAP) : null;
    },

    'deleteEvent' => function($root, $args) use ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM `greenlight-events` WHERE id = :id");
        return $stmt->execute([':id' => $args['id']]);
    },

    // Purchases
    'purchases' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $sql = "SELECT * FROM `greenlight-purchases` ORDER BY id ASC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Debug log: record fetch attempt and row count
        @mkdir(__DIR__ . '/tmp', 0755, true);
        @file_put_contents(__DIR__ . '/tmp/graphql-purchases.log', date('c') . " purchases fetched count=" . count($rows) . " limit={$limit} offset={$offset}\n", FILE_APPEND);
        $out = [];
        foreach ($rows as $r) {
            $mapped = mapDbRowToGraphQL($r, 'Purchase', $COL_MAP);
            $orgUsername = $r['organization'] ?? $r['organizationUsername'] ?? null;
            if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            $out[] = $mapped;
        }
        return $out;
    },

    'purchase' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-purchases` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $args['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $mapped = mapDbRowToGraphQL($row, 'Purchase', $COL_MAP);
            $orgUsername = $row['organization'] ?? $row['organizationUsername'] ?? null;
            if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            return $mapped;
        }
        return null;
    },

    'purchasesByOrganization' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        $orgUsername = $args['orgUsername'];
        $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
        $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
        $where = "`organization` = :orgUsername";
        $sql = "SELECT * FROM `greenlight-purchases` WHERE $where ORDER BY id ASC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':orgUsername', $orgUsername);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Debug log: record org fetch attempt and row count
        @mkdir(__DIR__ . '/tmp', 0755, true);
        @file_put_contents(__DIR__ . '/tmp/graphql-purchases.log', date('c') . " purchasesByOrg org={$orgUsername} count=" . count($rows) . " limit={$limit} offset={$offset}\n", FILE_APPEND);
        $out = [];
        foreach ($rows as $r) {
            $mapped = mapDbRowToGraphQL($r, 'Purchase', $COL_MAP);
            $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            $out[] = $mapped;
        }
        return $out;
    },

    'eventsByOrganization' => function($root, $args) use ($pdo, $fetchOrganization, $COL_MAP) {
        try {
            $orgUsername = $args['orgUsername'];
            $limit = isset($args['limit']) ? (int)$args['limit'] : 25;
            $offset = isset($args['offset']) ? (int)$args['offset'] : 0;
            $where = ["`organization` = :orgUsername"];
            $params = [':orgUsername' => $orgUsername];
            if (isset($args['status'])) { $where[] = "event_status = :status"; $params[':status'] = $args['status']; }
            if (isset($args['fromDate'])) { $where[] = "event_date >= :fromDate"; $params[':fromDate'] = $args['fromDate']; }
            if (isset($args['toDate'])) { $where[] = "event_date <= :toDate"; $params[':toDate'] = $args['toDate']; }
            $whereSql = 'WHERE ' . implode(' AND ', $where);
            $sql = "SELECT * FROM `greenlight-events` $whereSql ORDER BY id ASC LIMIT :limit OFFSET :offset";
            $stmt = $pdo->prepare($sql);
            foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $out = [];
            foreach ($rows as $r) {
                $mapped = mapDbRowToGraphQL($r, 'Event', $COL_MAP);
                if (array_key_exists('location_id', $r)) {
                    $mapped['locationId'] = $r['location_id'] === null ? null : (int)$r['location_id'];
                }
                $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
                $out[] = $mapped;
            }
            return $out;
        } catch (Throwable $e) {
            @mkdir(__DIR__ . '/tmp', 0755, true);
            @file_put_contents(__DIR__ . '/tmp/graphql-events-error.log', date('c') . " eventsByOrganization resolver error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
            throw $e;
        }
    },

    'createOrganization' => function($root, $args) use ($pdo, $COL_MAP) {
        $in = $args['input'];
        $cols = [];
        $placeholders = [];
        $params = [];
        foreach ($in as $k => $v) {
            $dbCol = $COL_MAP['Organization'][$k] ?? null;
            if (!$dbCol) continue;
            $cols[] = $dbCol;
            $placeholders[] = ":$k";
            $params[":$k"] = $v;
        }
        if (empty($cols)) throw new \Exception('No input provided');
        $sqlCols = implode('`,`', $cols);
        $placeholdersStr = implode(',', $placeholders);
        $stmt = $pdo->prepare("INSERT INTO `greenlight-orgs` (`$sqlCols`) VALUES ($placeholdersStr)");
        $stmt->execute($params);
        $id = $pdo->lastInsertId();
        $s = $pdo->prepare("SELECT * FROM `greenlight-orgs` WHERE id = :id LIMIT 1");
        $s->execute([':id'=>$id]);
        return $s->fetch(PDO::FETCH_ASSOC) ?: null;
    },

    // Create, update, delete users
    'createUser' => function($root, $args) use ($pdo, $COL_MAP) {
        $in = $args['input'];
        $cols = [];
        $placeholders = [];
        $params = [];
        foreach ($in as $k => $v) {
            if (!isset($COL_MAP['User'][$k])) continue;
            $dbCol = $COL_MAP['User'][$k];
            $cols[] = $dbCol;
            $placeholders[] = ":$k";
            $params[":$k"] = $v;
        }
        if (empty($cols)) throw new \Exception('No input provided');
        $sqlCols = implode('`,`', $cols);
        $placeholdersStr = implode(',', $placeholders);
        $stmt = $pdo->prepare("INSERT INTO `greenlight-users` (`$sqlCols`) VALUES ($placeholdersStr)");
        $stmt->execute($params);
        $id = $pdo->lastInsertId();
        $s = $pdo->prepare("SELECT * FROM `greenlight-users` WHERE id = :id LIMIT 1");
        $s->execute([':id' => $id]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        return $row ? mapDbRowToGraphQL($row, 'User', $COL_MAP) : null;
    },

    'updateUser' => function($root, $args) use ($pdo, $COL_MAP) {
        $id = $args['id'];
        $in = $args['input'];
        $set = [];
        $params = [':id' => $id];
        foreach ($in as $k => $v) {
            if (!isset($COL_MAP['User'][$k])) continue;
            $dbCol = $COL_MAP['User'][$k];
            $set[] = "`$dbCol` = :$k";
            $params[":$k"] = $v;
        }
        if (empty($set)) throw new \Exception('No fields to update');
        $sql = "UPDATE `greenlight-users` SET " . implode(',', $set) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $s = $pdo->prepare("SELECT * FROM `greenlight-users` WHERE id = :id LIMIT 1");
        $s->execute([':id' => $id]);
        $row = $s->fetch(PDO::FETCH_ASSOC);
        return $row ? mapDbRowToGraphQL($row, 'User', $COL_MAP) : null;
    },

    'deleteUser' => function($root, $args) use ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM `greenlight-users` WHERE id = :id");
        return $stmt->execute([':id' => $args['id']]);
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

    // Purchases mutations
    'createPurchase' => function($root, $args) use ($pdo, $COL_MAP, $fetchOrganization) {
        $input = $args['input'];
        $sql = "INSERT INTO `greenlight-purchases` (organization, date_submitted, item_title, item_category, event_id, order_status, item_cost) VALUES (:organization, :date_submitted, :item_title, :item_category, :event_id, :order_status, :item_cost)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':organization' => $input['organizationUsername'] ?? $input['organization'] ?? null,
            ':date_submitted' => $input['dateSubmitted'] ?? null,
            ':item_title' => $input['itemTitle'] ?? null,
            ':item_category' => $input['itemCategory'] ?? null,
            ':event_id' => $input['eventId'] ?? null,
            ':order_status' => $input['orderStatus'] ?? null,
            ':item_cost' => isset($input['itemCost']) ? (float)$input['itemCost'] : null,
        ]);
        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-purchases` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $mapped = mapDbRowToGraphQL($row, 'Purchase', $COL_MAP);
            $orgUsername = $row['organization'] ?? null;
            if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            return $mapped;
        }
        return null;
    },

    'updatePurchase' => function($root, $args) use ($pdo, $COL_MAP, $fetchOrganization) {
        $id = $args['id'];
        $input = $args['input'];
        $sql = "UPDATE `greenlight-purchases` SET organization = :organization, date_submitted = :date_submitted, item_title = :item_title, item_category = :item_category, event_id = :event_id, order_status = :order_status, item_cost = :item_cost WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':organization' => $input['organizationUsername'] ?? $input['organization'] ?? null,
            ':date_submitted' => $input['dateSubmitted'] ?? null,
            ':item_title' => $input['itemTitle'] ?? null,
            ':item_category' => $input['itemCategory'] ?? null,
            ':event_id' => $input['eventId'] ?? null,
            ':order_status' => $input['orderStatus'] ?? null,
            ':item_cost' => isset($input['itemCost']) ? (float)$input['itemCost'] : null,
            ':id' => $id,
        ]);
        $stmt = $pdo->prepare("SELECT * FROM `greenlight-purchases` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $mapped = mapDbRowToGraphQL($row, 'Purchase', $COL_MAP);
            $orgUsername = $row['organization'] ?? null;
            if ($orgUsername) $mapped['organization'] = $fetchOrganization($pdo, $orgUsername);
            return $mapped;
        }
        return null;
    },

    'deletePurchase' => function($root, $args) use ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM `greenlight-purchases` WHERE id = :id");
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

// Record request start to measure total handling time
$requestStart = microtime(true);
try {
    $result = GraphQL::executeQuery($schema, $query, $rootValue, null, $variables, null, null);
    $output = $result->toArray();
    header('Content-Type: application/json');
    echo json_encode($output);
    // Log timing for this GraphQL request in production troubleshooting logs
    $duration = round((microtime(true) - $requestStart) * 1000, 2);
    @mkdir(__DIR__ . '/tmp', 0755, true);
    $logLine = date('c') . " GRAPHQL_REQUEST path=" . ($_SERVER['REQUEST_URI'] ?? 'unknown') . " ms=" . $duration . " query=" . (strlen($query) > 200 ? substr($query,0,200) . '...' : $query) . "\n";
    @file_put_contents(__DIR__ . '/tmp/graphql-timings.log', $logLine, FILE_APPEND);
} catch (Throwable $e) {
    http_response_code(500);
    @mkdir(__DIR__ . '/tmp', 0755, true);
    @file_put_contents(__DIR__ . '/tmp/graphql-timings.log', date('c') . " GRAPHQL_ERROR path=" . ($_SERVER['REQUEST_URI'] ?? 'unknown') . " message=" . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
    echo json_encode(['errors' => [['message' => $e->getMessage()]]]);
}