<?php
require 'db_connection.php';

$id = intval($_GET['id']);

// First, delete related memberships
mysqli_query($conn, "DELETE FROM memberships WHERE student_id = $id");

// Then delete the student
mysqli_query($conn, "DELETE FROM students WHERE id = $id");

echo "Student deleted";
?>
