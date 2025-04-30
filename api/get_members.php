<?php
// Ensure the correct file is included
require 'db_connection.php'; 

$club_id = $_GET['club_id'] ?? 0;

// Query to fetch the members
$query = "
  SELECT m.*, s.name, s.admission_no 
  FROM memberships m 
  JOIN students s ON s.id = m.student_id 
  WHERE m.club_id = $club_id 
  ORDER BY m.date_joined DESC
";

$result = mysqli_query($conn, $query);

if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}

$active = [];
$left = [];

while ($row = mysqli_fetch_assoc($result)) {
  if ($row['status'] === 'ACTIVE') {
    $active[] = $row;
  } else {
    $left[] = $row;
  }
}

echo json_encode(['active' => $active, 'left' => $left]);

// Close the connection
mysqli_close($conn);
?>
