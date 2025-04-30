<?php
require 'db_connection.php';
header('Content-Type: application/json');

$id = intval($_GET['id']);

$sql = "
  SELECT c.name,c.patron_name,
    COALESCE(COUNT(DISTINCT m.id), 0) as total_members,
    COALESCE(f.total_registration, 0) as total_registration,
    COALESCE(GROUP_CONCAT(DISTINCT a.activity_name SEPARATOR ', '), '') as activities
  FROM clubs c
  LEFT JOIN memberships m ON c.id = m.club_id AND m.year = YEAR(CURDATE())
  LEFT JOIN club_finances f ON c.id = f.club_id
  LEFT JOIN club_activities a ON c.id = a.club_id
  WHERE c.id = $id
  GROUP BY c.id
";

$result = mysqli_query($conn, $sql);
$club = mysqli_fetch_assoc($result);

echo json_encode($club);
?>
