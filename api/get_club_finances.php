<?php
require 'db_connection.php';

$club_id = $_GET['club_id'] ?? 0;

$sql = "SELECT f.*, c.name as club_name,
        (f.total_registration + f.total_activity_income + f.ongoing_activities_fund + 
         f.annual_party_fund + f.savings + f.school_contribution) AS total_amount
        FROM club_finances f 
        JOIN clubs c ON c.id = f.club_id 
        WHERE f.club_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $club_id);
$stmt->execute();
$result = $stmt->get_result();

if ($finance = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'finance' => $finance]);
} else {
    echo json_encode(['success' => false]);
}
?>
