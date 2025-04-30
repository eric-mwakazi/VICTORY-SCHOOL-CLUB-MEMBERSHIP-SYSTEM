<?php
require 'db_connection.php';
header('Content-Type: application/json');

$id = intval($_GET['id']);
$result = mysqli_query($conn, "SELECT * FROM students WHERE id = $id");
echo json_encode(mysqli_fetch_assoc($result));
?>
