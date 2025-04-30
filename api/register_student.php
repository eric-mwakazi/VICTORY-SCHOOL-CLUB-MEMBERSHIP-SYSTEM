<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db_connection.php';
header('Content-Type: application/json');

// Validate required fields
if (
    !isset(
        $_POST['admission_no'],
        $_POST['studentRole'],
        $_POST['studentStream'],
        $_POST['studentName'],
        $_POST['clubs']
    )
) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

$admission_no = mysqli_real_escape_string($conn, $_POST['admission_no']);
$studentRole = mysqli_real_escape_string($conn, $_POST['studentRole']);
$studentStream = mysqli_real_escape_string($conn, $_POST['studentStream']);
$studentName = mysqli_real_escape_string($conn, $_POST['studentName']);
$studentClubs = $_POST['clubs'];
$year = date('Y');
$errors = 0;

// Insert student if not exists
$student_check = mysqli_query($conn, "SELECT id FROM students WHERE admission_no = '$admission_no'");
if (mysqli_num_rows($student_check) > 0) {
    $student = mysqli_fetch_assoc($student_check);
    $student_id = $student['id'];
} else {
    $insert_student = mysqli_query($conn, "INSERT INTO students (admission_no, name, class) VALUES ('$admission_no', '$studentName', '$studentStream')");
    if (!$insert_student) {
        echo json_encode(['success' => false, 'message' => 'Failed to insert student.']);
        exit;
    }
    $student_id = mysqli_insert_id($conn);
}

// Register student to clubs
foreach ($studentClubs as $club_id) {
    // Avoid duplicate active memberships
    $check_membership = mysqli_query($conn, "SELECT id FROM memberships WHERE student_id = $student_id AND club_id = $club_id AND year = $year AND status = 'ACTIVE'");
    if (mysqli_num_rows($check_membership) == 0) {
        // Insert membership with ACTIVE status
        $insert = mysqli_query($conn, "
            INSERT INTO memberships (student_id, club_id, role, status, year)
            VALUES ($student_id, $club_id, '$studentRole', 'ACTIVE', $year)
        ");
        if (!$insert) {
            $errors++;
            continue;
        }

        // Update club finances
        $club_check = mysqli_query($conn, "SELECT registration_fee FROM clubs WHERE id = $club_id");
        if (mysqli_num_rows($club_check) > 0) {
            $club = mysqli_fetch_assoc($club_check);
            $registration_fee = $club['registration_fee'];

            // Update total_registration in club_finances
            $update_finances = mysqli_query($conn, "
                UPDATE club_finances
                SET total_registration = total_registration + $registration_fee
                WHERE club_id = $club_id
            ");
            if (!$update_finances) $errors++;
        }
    }
}

if ($errors === 0) {
    echo json_encode(['success' => true, 'message' => 'Student registered successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Student registered, but some club registrations failed.']);
}
?>

