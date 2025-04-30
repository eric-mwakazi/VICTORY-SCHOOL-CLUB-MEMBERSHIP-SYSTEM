<?php
require 'db_connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? null;
$admission_no = $data['admission_no'] ?? null;
$name = $data['name'] ?? null;
$class = $data['class'] ?? null;

if (!$id || !$admission_no || !$name || !$class) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$query = "UPDATE students SET admission_no = ?, name = ?, class = ? WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("sssi", $admission_no, $name, $class, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>
