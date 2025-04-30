<?php
require 'db_connection.php';

$club_id = $_GET['club_id'] ?? 0;

$clubRes = mysqli_query($conn, "SELECT name FROM clubs WHERE id = $club_id");
$club = mysqli_fetch_assoc($clubRes);

$financeRes = mysqli_query($conn, "SELECT * FROM club_finances WHERE club_id = $club_id");
$finances = mysqli_fetch_assoc($financeRes);

$activitiesRes = mysqli_query($conn, "SELECT activity_name, date_of_activity, amount_collected FROM club_activities WHERE club_id = $club_id");
$activities = [];
while ($row = mysqli_fetch_assoc($activitiesRes)) $activities[] = $row;

echo json_encode([
  'club_name' => $club['name'],
  'finances' => $finances,
  'activities' => $activities
]);
?>
