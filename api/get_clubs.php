<?php
require 'db_connection.php';

header('Content-Type: application/json');

$sql = "SELECT id, name, registration_fee FROM clubs";
$result = mysqli_query($conn, $sql);

$clubs = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $clubs[] = $row;
    }
}

echo json_encode($clubs);
?>
