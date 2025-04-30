<?php
require 'db_connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    $club_id = intval($_DELETE['id']);

    // Optional: delete related memberships and activities first (due to foreign key constraints)
    mysqli_query($conn, "DELETE FROM memberships WHERE club_id = $club_id");
    mysqli_query($conn, "DELETE FROM club_activities WHERE club_id = $club_id");
    mysqli_query($conn, "DELETE FROM club_finances WHERE club_id = $club_id");

    $deleteResult = mysqli_query($conn, "DELETE FROM clubs WHERE id = $club_id");

    echo json_encode(['success' => $deleteResult]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>
