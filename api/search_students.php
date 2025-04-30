<?php
require 'db_connection.php';
$search = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : '';
$sql = "SELECT id, name, admission_no FROM students WHERE name LIKE '%$search%' OR admission_no LIKE '%$search%' LIMIT 10";
$res = mysqli_query($conn, $sql);

$students = [];
while ($row = mysqli_fetch_assoc($res)) {
  $students[] = $row;
}
echo json_encode($students);
