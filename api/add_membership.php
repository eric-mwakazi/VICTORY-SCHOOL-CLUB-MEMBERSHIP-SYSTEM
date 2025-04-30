<?php
require 'db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$student_id = intval($data['student_id']);
$club_id = intval($data['club_id']);
$year = date('Y');

// Check if student exists
$query = "SELECT id FROM students WHERE id = $student_id";
$result = mysqli_query($conn, $query);
if (mysqli_num_rows($result) == 0) {
    echo json_encode(["success" => false, "message" => "Student not found."]);
    exit;
}

// Check if club exists
$query = "SELECT id FROM clubs WHERE id = $club_id";
$result = mysqli_query($conn, $query);
if (mysqli_num_rows($result) == 0) {
    echo json_encode(["success" => false, "message" => "Club not found."]);
    exit;
}

// Check if student is already a member of the club
$query = "SELECT id FROM memberships WHERE student_id = $student_id AND club_id = $club_id AND year = $year";
$result = mysqli_query($conn, $query);
if (mysqli_num_rows($result) > 0) {
    echo json_encode(["success" => false, "message" => "Student is already a member of this club."]);
    exit;
}

// Insert into memberships
$query = "INSERT INTO memberships (student_id, club_id, role, year) VALUES ($student_id, $club_id, 'Regular', $year)";
$result = mysqli_query($conn, $query);

echo json_encode(['success' => $result]);
?>
