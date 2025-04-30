<?php
require 'db_connection.php';
header('Content-Type: application/json');

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
$limit = 10;
$offset = ($page - 1) * $limit;

$where = '';
if ($search !== '') {
  $where = "WHERE admission_no LIKE '%$search%' OR name LIKE '%$search%'";
}

$totalQuery = mysqli_query($conn, "SELECT COUNT(*) as count FROM students $where");
$totalRows = mysqli_fetch_assoc($totalQuery)['count'];
$totalPages = ceil($totalRows / $limit);

$query = "SELECT id, admission_no, name, class FROM students $where LIMIT $limit OFFSET $offset";
$result = mysqli_query($conn, $query);

$students = [];
while ($row = mysqli_fetch_assoc($result)) {
  $students[] = $row;
}

echo json_encode([
  'students' => $students,
  'total_pages' => $totalPages
]);
?>
