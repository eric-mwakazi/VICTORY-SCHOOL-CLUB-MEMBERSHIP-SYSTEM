<?php
require 'db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$membership_id = $data['membership_id'] ?? 0;

$stmt = $conn->prepare("UPDATE memberships SET status='ACTIVE', date_left=NULL WHERE id=?");
$success = $stmt->execute([$membership_id]);

echo json_encode(['success' => $success]);
?>
