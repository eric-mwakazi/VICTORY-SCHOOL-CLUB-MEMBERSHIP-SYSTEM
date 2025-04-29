<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db_connection.php';

header('Content-Type: application/json');

// Basic validation
if (!isset($_POST['admission_no'], $_POST['name'], $_POST['class'], $_POST['clubs'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

$admission_no = mysqli_real_escape_string($conn, $_POST['admission_no']);
$name = mysqli_real_escape_string($conn, $_POST['name']);
$class = mysqli_real_escape_string($conn, $_POST['class']);
$clubs = $_POST['clubs']; // Clubs are now an array

// Insert student if not exists
$student_check = mysqli_query($conn, "SELECT id FROM students WHERE admission_no = '$admission_no'");
if (mysqli_num_rows($student_check) > 0) {
    $student = mysqli_fetch_assoc($student_check);
    $student_id = $student['id'];
} else {
    $insert_student = mysqli_query($conn, "INSERT INTO students (admission_no, name, class) VALUES ('$admission_no', '$name', '$class')");
    if (!$insert_student) {
        echo json_encode(['success' => false, 'message' => 'Failed to insert student.']);
        exit;
    }
    $student_id = mysqli_insert_id($conn);
}

// Insert memberships
$year = date('Y');
$errors = 0;

foreach ($clubs as $club_id) {
    // Check if already registered to avoid duplicates
    $check_membership = mysqli_query($conn, "SELECT id FROM memberships WHERE student_id = $student_id AND club_id = $club_id AND year = $year");
    if (mysqli_num_rows($check_membership) == 0) {
        $insert = mysqli_query($conn, "INSERT INTO memberships (student_id, club_id, year) VALUES ($student_id, $club_id, $year)");
        if (!$insert) $errors++;
    }
}

if ($errors === 0) {
    echo json_encode(['success' => true, 'message' => 'Student registered successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Student registered, but some club registrations failed.']);
}

?>
