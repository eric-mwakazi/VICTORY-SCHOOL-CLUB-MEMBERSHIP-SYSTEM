<?php
require 'db_connection.php';
header('Content-Type: application/json');

$sql = "
  SELECT c.id, c.name,
    COALESCE(COUNT(DISTINCT m.id), 0) AS total_members,
    COALESCE(f.total_registration, 0) AS total_registration,
    COALESCE(GROUP_CONCAT(DISTINCT a.activity_name SEPARATOR ', '), '') AS activities
  FROM clubs c
  LEFT JOIN memberships m ON c.id = m.club_id AND m.year = YEAR(CURDATE())
  LEFT JOIN club_finances f ON c.id = f.club_id
  LEFT JOIN club_activities a ON c.id = a.club_id
  GROUP BY c.id
";


$result = mysqli_query($conn, $sql);
$clubs = [];

while ($row = mysqli_fetch_assoc($result)) {
  $clubs[] = $row;
}

echo json_encode($clubs);
?>
