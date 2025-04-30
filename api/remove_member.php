<?php
require 'db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$membership_id = $data['membership_id'] ?? 0;

// Prepare the update query
$stmt = mysqli_prepare($conn, "UPDATE memberships SET status='LEFT', date_left=NOW() WHERE id=?");

if ($stmt) {
    mysqli_stmt_bind_param($stmt, 'i', $membership_id);
    $success = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
} else {
    $success = false;
}

echo json_encode(['success' => $success]);
?>
