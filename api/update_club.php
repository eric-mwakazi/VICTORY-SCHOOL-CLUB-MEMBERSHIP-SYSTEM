<?php
require 'db_connection.php';

header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);

$club_id = intval($data['club_id']);
$patron_name = mysqli_real_escape_string($conn, $data['patron_name']);
$registration_fee = intval($data['registration_fee']);
$activities = isset($data['activities']) ? mysqli_real_escape_string($conn, $data['activities']) : null;

// Update club details
$updateQuery = "UPDATE clubs SET patron_name = '$patron_name', registration_fee = $registration_fee WHERE id = $club_id";
$updateResult = mysqli_query($conn, $updateQuery);

// Optional: update activities if provided
if ($activities !== null) {
    // Delete existing activities for the club (optional)
    mysqli_query($conn, "DELETE FROM club_activities WHERE club_id = $club_id");

    // Insert new activities (assuming newline-separated)
    $activityLines = explode("\n", $activities);
    foreach ($activityLines as $line) {
        $name = trim($line);
        if ($name !== '') {
            $nameEscaped = mysqli_real_escape_string($conn, $name);
            mysqli_query($conn, "INSERT INTO club_activities (club_id, activity_name, date_of_activity, amount_collected)
                                 VALUES ($club_id, '$nameEscaped', CURDATE(), 0)");
        }
    }
}

echo json_encode(['success' => $updateResult]);
?>
