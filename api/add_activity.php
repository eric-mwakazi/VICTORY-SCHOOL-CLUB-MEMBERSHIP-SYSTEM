<?php
require 'db_connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$club_id = intval($data['club_id']);
$activity_name = mysqli_real_escape_string($conn, $data['activity_name']);
$date = mysqli_real_escape_string($conn, $data['date_of_activity']); // e.g. '2025-05-01'
$amount = intval($data['amount_collected']);

// Insert the new activity into club_activities
$query = "INSERT INTO club_activities (club_id, activity_name, date_of_activity, amount_collected)
          VALUES ($club_id, '$activity_name', '$date', $amount)";

$result = mysqli_query($conn, $query);

if ($result) {
    // Update the total_activity_income in club_finances
    $update_query = "UPDATE club_finances 
                     SET total_activity_income = total_activity_income + $amount 
                     WHERE club_id = $club_id";
    $update_result = mysqli_query($conn, $update_query);

    if ($update_result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
}
?>
